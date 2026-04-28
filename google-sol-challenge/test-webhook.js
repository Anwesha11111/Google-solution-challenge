#!/usr/bin/env node

// ============================================================
// test-webhook.js — Simulate WhatsApp webhook calls locally
// Usage: node test-webhook.js <coordinator|volunteer> <message>
// ============================================================

require('dotenv').config();

const axios = require('axios');

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/webhook/whatsapp';

/**
 * Simulate a coordinator sending a need
 */
async function simulateCoordinator(message) {
  const payload = {
    entry: [
      {
        changes: [
          {
            value: {
              messages: [
                {
                  from: '919999999998',  // Different from test volunteer
                  text: { body: message }
                }
              ]
            }
          }
        ]
      }
    ]
  };

  console.log(`📤 Sending coordinator message: "${message}"`);
  console.log(`📍 Webhook URL: ${WEBHOOK_URL}\n`);

  try {
    const res = await axios.post(WEBHOOK_URL, payload);
    console.log('✅ Response:', res.status);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

/**
 * Simulate a volunteer replying
 */
async function simulateVolunteer(message) {
  const payload = {
    entry: [
      {
        changes: [
          {
            value: {
              messages: [
                {
                  from: '919999999999',  // Test volunteer from schema.sql
                  text: { body: message }
                }
              ]
            }
          }
        ]
      }
    ]
  };

  console.log(`📤 Sending volunteer message: "${message}"`);
  console.log(`📍 Webhook URL: ${WEBHOOK_URL}\n`);

  try {
    const res = await axios.post(WEBHOOK_URL, payload);
    console.log('✅ Response:', res.status);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

/**
 * Test webhook verification
 */
async function testVerification() {
  const token = process.env.WA_VERIFY_TOKEN || 'test-token';
  const url = `${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=${token}&hub.challenge=test-challenge-123`;

  console.log(`🔐 Testing webhook verification`);
  console.log(`📍 URL: ${url}\n`);

  try {
    const res = await axios.get(url);
    console.log('✅ Verification successful');
    console.log('Response:', res.data);
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
  }
}

// ============================================================
// MAIN
// ============================================================

const [, , type, ...messageParts] = process.argv;
const message = messageParts.join(' ');

if (!type) {
  console.log(`
SEVA-OS Webhook Tester

Usage: node test-webhook.js <command> [message]

Commands:
  verify              Test webhook verification
  coordinator <msg>   Simulate coordinator message
  volunteer <msg>     Simulate volunteer reply

Examples:
  node test-webhook.js verify
  node test-webhook.js coordinator "Food needed at 400001"
  node test-webhook.js volunteer "YES"
  node test-webhook.js volunteer "DONE"

Environment:
  WEBHOOK_URL=${WEBHOOK_URL}
  WA_VERIFY_TOKEN=${process.env.WA_VERIFY_TOKEN || 'not-set'}
  `);
  process.exit(0);
}

(async () => {
  if (type === 'verify') {
    await testVerification();
  } else if (type === 'coordinator') {
    await simulateCoordinator(message);
  } else if (type === 'volunteer') {
    await simulateVolunteer(message);
  } else {
    console.error(`Unknown command: ${type}`);
    process.exit(1);
  }
})();
