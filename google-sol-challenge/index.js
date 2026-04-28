// ============================================================
// index.js — SEVA-OS Express Server
// Webhook receiver + dispatch state machine
// ============================================================

require('dotenv').config();

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');
const {
  extractNeedSignal,
  sendDispatchAlert,
  sendAcceptanceConfirmation,
  sendImpactAck,
  sendStuckAlert
} = require('./services');

const app  = express();
const PORT = process.env.PORT || 3000;

// Retry queue for failed dispatches
const retryQueue = new Map();

// Parse JSON bodies
app.use(express.json());

// ------------------------------------------------------------
// Supabase client (uses service role key for full DB access)
// ------------------------------------------------------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================================
// WEBHOOK VERIFICATION (Meta requires a GET handshake)
// ============================================================
app.get('/webhook/whatsapp', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WA_VERIFY_TOKEN) {
    logger.info('Webhook verified by Meta');
    return res.status(200).send(challenge);
  }
  logger.warn('Webhook verification failed', { mode, token });
  res.sendStatus(403);
});

// ============================================================
// MAIN WEBHOOK — receives all incoming WhatsApp messages
// ============================================================
app.post('/webhook/whatsapp', async (req, res) => {
  // Acknowledge immediately — Meta will retry if we don't respond fast
  res.sendStatus(200);

  try {
    const entry   = req.body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value   = changes?.value;

    // Ignore status updates (delivery receipts, read receipts)
    if (!value?.messages) return;

    const message     = value.messages[0];
    const senderPhone = message.from;           // E.164 without '+', e.g. "919876543210"
    const messageText = message.text?.body?.trim().toUpperCase();

    if (!messageText) return; // ignore non-text messages (images, etc.)

    logger.info('Incoming message', { phone: senderPhone, text: messageText });

    // ----------------------------------------------------------
    // ROUTE: Volunteer replies
    // ----------------------------------------------------------
    const isVolunteer = await checkIfVolunteer(senderPhone);

    if (isVolunteer) {
      await handleVolunteerReply(senderPhone, messageText);
      return;
    }

    // ----------------------------------------------------------
    // ROUTE: Coordinator message — treat as a new Need
    // ----------------------------------------------------------
    await handleCoordinatorMessage(senderPhone, message.text.body);

  } catch (err) {
    logger.error('Webhook processing error', { error: err.message, stack: err.stack });
  }
});

// ============================================================
// COORDINATOR FLOW: Extract → Store → Match → Dispatch
// ============================================================
async function handleCoordinatorMessage(senderPhone, rawText) {
  logger.info('Processing coordinator need', { phone: senderPhone });

  // Step 1: Extract structured signal via LLM
  let signal;
  try {
    signal = await extractNeedSignal(rawText);
    logger.debug('Extracted signal', signal);
  } catch (err) {
    logger.error('LLM extraction failed', { error: err.message });
    return; // silently fail — don't crash the server
  }

  // Step 2: Persist the Need
  const { data: need, error: needErr } = await supabase
    .from('needs')
    .insert({
      original_text: rawText,
      category:      signal.category,
      pincode:       signal.pincode,
      urgency:       signal.urgency,
      status:        'open'
    })
    .select()
    .single();

  if (needErr) {
    logger.error('Failed to insert need', { error: needErr.message });
    return;
  }

  logger.info('Need created', { needId: need.id, category: need.category });

  // Step 3: Match volunteers and dispatch
  await matchAndDispatch(need);
}

// ============================================================
// DISPATCH LOGIC: Find top 3 volunteers → Send alerts → Log
// ============================================================
async function matchAndDispatch(need) {
  // Query: available volunteers with matching skill, same pincode first
  // Supabase doesn't support ORDER BY pincode match natively, so we do two queries:

  // Priority 1 — same pincode
  const { data: localVols } = await supabase
    .from('volunteers')
    .select('*')
    .eq('status', 'available')
    .eq('pincode', need.pincode)
    .contains('skills', [need.category])
    .order('reliability_score', { ascending: false })
    .limit(3);

  // Priority 2 — any pincode (fill remaining slots)
  let candidates = localVols || [];

  if (candidates.length < 3) {
    const existingIds = candidates.map(v => v.id);
    const { data: remoteVols } = await supabase
      .from('volunteers')
      .select('*')
      .eq('status', 'available')
      .contains('skills', [need.category])
      .not('id', 'in', `(${existingIds.join(',') || 'null'})`)
      .order('reliability_score', { ascending: false })
      .limit(3 - candidates.length);

    candidates = [...candidates, ...(remoteVols || [])];
  }

  if (candidates.length === 0) {
    logger.warn('No available volunteers for need', { needId: need.id, category: need.category });
    return;
  }

  logger.info('Dispatching to volunteers', { needId: need.id, count: candidates.length });

  // Send alerts and create Dispatch records
  for (const vol of candidates) {
    try {
      await sendDispatchAlert(vol.phone_number, need.category, need.pincode);

      await supabase.from('dispatches').insert({
        need_id:      need.id,
        volunteer_id: vol.id,
        status:       'pending'
      });

      logger.debug('Alert sent', { phone: vol.phone_number, needId: need.id });
    } catch (err) {
      logger.error('Failed to dispatch', { phone: vol.phone_number, error: err.message });
    }
  }
}

// ============================================================
// VOLUNTEER STATE MACHINE: YES / NO / DONE / STUCK
// ============================================================
async function handleVolunteerReply(phone, text) {
  // Fetch the volunteer record
  const { data: vol } = await supabase
    .from('volunteers')
    .select('*')
    .eq('phone_number', phone)
    .single();

  if (!vol) {
    logger.warn('Unknown volunteer', { phone });
    return;
  }

  // Find their most recent pending or accepted dispatch
  const { data: dispatch } = await supabase
    .from('dispatches')
    .select('*, needs(*)')
    .eq('volunteer_id', vol.id)
    .in('status', ['pending', 'accepted'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // ---- YES ----
  if (text === 'YES') {
    if (!dispatch || dispatch.status !== 'pending') {
      logger.debug('YES reply without pending dispatch', { phone });
      return;
    }

    // Update dispatch → accepted
    await supabase
      .from('dispatches')
      .update({ status: 'accepted' })
      .eq('id', dispatch.id);

    // Update need → dispatched
    await supabase
      .from('needs')
      .update({ status: 'dispatched' })
      .eq('id', dispatch.need_id);

    // Mark volunteer as busy
    await supabase
      .from('volunteers')
      .update({ status: 'busy' })
      .eq('id', vol.id);

    await sendAcceptanceConfirmation(phone, dispatch.needs.category, dispatch.needs.pincode);
    logger.info('Dispatch accepted', { phone, dispatchId: dispatch.id });
  }

  // ---- NO ----
  else if (text === 'NO') {
    if (!dispatch || dispatch.status !== 'pending') return;

    // Just mark this dispatch as stuck so another volunteer can pick it up
    await supabase
      .from('dispatches')
      .update({ status: 'stuck' })
      .eq('id', dispatch.id);

    logger.info('Dispatch declined', { phone, dispatchId: dispatch.id });
    // Optionally re-dispatch to next volunteer here
  }

  // ---- DONE ----
  else if (text === 'DONE') {
    if (!dispatch || dispatch.status !== 'accepted') return;

    // Update dispatch → done
    await supabase
      .from('dispatches')
      .update({ status: 'done' })
      .eq('id', dispatch.id);

    // Update need → resolved
    await supabase
      .from('needs')
      .update({ status: 'resolved' })
      .eq('id', dispatch.need_id);

    // Free up volunteer + increment impact
    await supabase
      .from('volunteers')
      .update({
        status:       'available',
        total_impact: vol.total_impact + 1
      })
      .eq('id', vol.id);

    await sendImpactAck(phone);
    logger.info('Dispatch completed', { phone, dispatchId: dispatch.id, impact: vol.total_impact + 1 });
  }

  // ---- STUCK ----
  else if (text === 'STUCK') {
    if (!dispatch || dispatch.status !== 'accepted') return;

    // Update dispatch → stuck
    await supabase
      .from('dispatches')
      .update({ status: 'stuck' })
      .eq('id', dispatch.id);

    // Free up volunteer but ding reliability
    await supabase
      .from('volunteers')
      .update({
        status:            'available',
        reliability_score: Math.max(0, vol.reliability_score - 10)
      })
      .eq('id', vol.id);

    await sendStuckAlert(phone, dispatch.need_id);
    logger.warn('Volunteer stuck', { phone, dispatchId: dispatch.id, newReliability: Math.max(0, vol.reliability_score - 10) });
  }
}

// ============================================================
// HELPERS
// ============================================================

/** Returns true if the phone number belongs to a registered volunteer */
async function checkIfVolunteer(phone) {
  const { data } = await supabase
    .from('volunteers')
    .select('id')
    .eq('phone_number', phone)
    .single();
  return !!data;
}

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/health', (_, res) => {
  res.json({ status: 'ok', service: 'SEVA-OS', timestamp: new Date().toISOString() });
});

// ============================================================
// START
// ============================================================
app.listen(PORT, () => {
  logger.info('SEVA-OS server started', { port: PORT, env: process.env.NODE_ENV || 'development' });
});
