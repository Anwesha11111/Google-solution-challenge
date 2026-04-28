// ============================================================
// services.js — External API integrations
// LLM extraction (Gemini/Groq) + WhatsApp Cloud API calls
// ============================================================

const axios = require('axios');

// ------------------------------------------------------------
// LLM: Extract structured need signal from raw text
// Supports Gemini (default) or Groq — set LLM_PROVIDER in .env
// ------------------------------------------------------------

/**
 * Calls the configured LLM and returns a structured need object.
 * @param {string} text - Raw WhatsApp message from coordinator
 * @returns {Promise<{category: string, pincode: string, urgency: string}>}
 */
async function extractNeedSignal(text) {
  const systemPrompt = `You are a disaster-relief triage assistant.
Read the message and return ONLY a valid JSON object — no markdown, no explanation.
JSON structure: { "category": "food|medical|shelter|safety", "pincode": "6-digit string", "urgency": "high|low" }
If pincode is missing, use "000000". If category is unclear, use "safety".`;

  const provider = process.env.LLM_PROVIDER || 'gemini'; // 'gemini' or 'groq'

  if (provider === 'groq') {
    return extractWithGroq(text, systemPrompt);
  }
  return extractWithGemini(text, systemPrompt);
}

async function extractWithGemini(text, systemPrompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const body = {
    contents: [
      {
        parts: [
          { text: `${systemPrompt}\n\nMessage: "${text}"` }
        ]
      }
    ],
    generationConfig: { temperature: 0, maxOutputTokens: 200 }
  };

  const res = await axios.post(url, body);
  const raw = res.data.candidates[0].content.parts[0].text.trim();

  // Strip markdown code fences if model wraps in ```json ... ```
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  return JSON.parse(cleaned);
}

async function extractWithGroq(text, systemPrompt) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const body = {
    model: 'llama3-8b-8192',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: `Message: "${text}"` }
    ],
    temperature: 0,
    max_tokens: 200
  };

  const res = await axios.post(url, body, {
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }
  });

  const raw = res.data.choices[0].message.content.trim();
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  return JSON.parse(cleaned);
}

// ------------------------------------------------------------
// WhatsApp Cloud API helpers
// ------------------------------------------------------------

const WA_BASE = `https://graph.facebook.com/v19.0/${process.env.WA_PHONE_NUMBER_ID}/messages`;
const WA_HEADERS = () => ({
  Authorization: `Bearer ${process.env.WA_ACCESS_TOKEN}`,
  'Content-Type': 'application/json'
});

/**
 * Send a plain text WhatsApp message.
 * @param {string} to      - Recipient phone in E.164 without '+' e.g. "919876543210"
 * @param {string} message - Text body
 */
async function sendWhatsAppMessage(to, message) {
  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: message }
  };

  const res = await axios.post(WA_BASE, body, { headers: WA_HEADERS() });
  return res.data;
}

/**
 * Send the dispatch alert to a volunteer.
 * Uses a plain text message (no approved template needed for replies within 24h window).
 */
async function sendDispatchAlert(volunteerPhone, category, pincode) {
  const msg =
    `🚨 SEVA-OS ALERT\n` +
    `Need: *${category.toUpperCase()}* at pincode *${pincode}*\n\n` +
    `Reply *YES* to accept this assignment.\n` +
    `Reply *NO* to pass.`;

  return sendWhatsAppMessage(volunteerPhone, msg);
}

/**
 * Send confirmation to an accepted volunteer with coordinator contact.
 * In production replace hardcoded contact with a DB lookup.
 */
async function sendAcceptanceConfirmation(volunteerPhone, category, pincode) {
  const msg =
    `✅ Assignment accepted! Thank you.\n\n` +
    `*Task:* ${category} at ${pincode}\n` +
    `*Coordinator:* +91-XXXXX-XXXXX\n\n` +
    `Reply *DONE* when complete, or *STUCK* if you need help.`;

  return sendWhatsAppMessage(volunteerPhone, msg);
}

/**
 * Send a thank-you message after DONE.
 */
async function sendImpactAck(volunteerPhone) {
  return sendWhatsAppMessage(
    volunteerPhone,
    `🙏 Thank you! Your impact has been logged. You're making a difference.`
  );
}

/**
 * Notify coordinator/admin that a volunteer is stuck.
 */
async function sendStuckAlert(volunteerPhone, needId) {
  // Notify the admin number about the stuck dispatch
  const adminPhone = process.env.ADMIN_PHONE;
  if (adminPhone) {
    await sendWhatsAppMessage(
      adminPhone,
      `⚠️ SEVA-OS: Volunteer ${volunteerPhone} is STUCK on need ${needId}. Manual intervention required.`
    );
  }
  // Acknowledge to the volunteer
  return sendWhatsAppMessage(
    volunteerPhone,
    `⚠️ Got it. We've alerted the coordinator. Hang tight — help is on the way.`
  );
}

module.exports = {
  extractNeedSignal,
  sendWhatsAppMessage,
  sendDispatchAlert,
  sendAcceptanceConfirmation,
  sendImpactAck,
  sendStuckAlert
};
