# SEVA-OS — Zero-Interface Volunteer Dispatch Engine

A WhatsApp-first, zero-budget MVP for coordinating disaster relief volunteers. Built on free tiers: Supabase, Gemini/Groq, Meta WhatsApp Cloud API, and Render.

## Architecture

```
Coordinator (WhatsApp)
    ↓
[Webhook] → Extract (LLM) → Match (Supabase) → Dispatch (WhatsApp)
    ↑                                              ↓
    └─ Volunteer replies (YES/NO/DONE/STUCK) ────┘
```

No frontend. No database setup. No credit card.

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd seva-os
npm install
cp .env.example .env
```

### 2. Set Up Supabase (Free Tier)

- Go to [supabase.com](https://supabase.com) → Create project
- In SQL Editor, paste contents of `schema.sql` and run
- Copy your project URL and service role key into `.env`

### 3. Set Up WhatsApp Cloud API

- Go to [Meta Developers](https://developers.facebook.com)
- Create an app → WhatsApp → Get your phone number ID and access token
- Add to `.env`
- Set webhook URL: `https://your-render-url.onrender.com/webhook/whatsapp`
- Verify token: use any random string (e.g., `my-secret-token-123`)

### 4. Set Up LLM (Pick One)

**Gemini (recommended for free tier):**
- Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
- Create API key → add to `.env` as `GEMINI_API_KEY`

**Groq (faster, also free):**
- Go to [console.groq.com](https://console.groq.com)
- Create API key → add to `.env` as `GROQ_API_KEY`
- Set `LLM_PROVIDER=groq`

### 5. Deploy to Render (Free Tier)

```bash
git push origin main
```

- Go to [render.com](https://render.com) → New Web Service
- Connect your GitHub repo
- Build command: `npm install`
- Start command: `node index.js`
- Add all env vars from `.env`
- Deploy

Your webhook URL: `https://your-app-name.onrender.com/webhook/whatsapp`

---

## API Reference

### Webhook: POST `/webhook/whatsapp`

Meta sends all incoming messages here. The server automatically routes:

- **Coordinator message** → Extract need → Dispatch to volunteers
- **Volunteer "YES"** → Accept dispatch, mark busy
- **Volunteer "NO"** → Decline, stay available
- **Volunteer "DONE"** → Complete task, increment impact
- **Volunteer "STUCK"** → Alert admin, ding reliability

### Health Check: GET `/health`

```bash
curl https://your-app.onrender.com/health
# { "status": "ok", "service": "SEVA-OS" }
```

---

## Database Schema

### `volunteers`
- `id` (UUID)
- `phone_number` (E.164, e.g., `919876543210`)
- `pincode` (6-digit area code)
- `skills` (array: `['food', 'medical', 'shelter', 'safety']`)
- `status` (`available` | `busy`)
- `reliability_score` (0–100, starts at 100)
- `total_impact` (incremented on DONE)

### `needs`
- `id` (UUID)
- `original_text` (raw coordinator message)
- `category` (`food` | `medical` | `shelter` | `safety`)
- `pincode` (extracted or defaulted to `000000`)
- `urgency` (`high` | `low`)
- `status` (`open` | `dispatched` | `resolved`)

### `dispatches`
- `id` (UUID)
- `need_id` (FK to needs)
- `volunteer_id` (FK to volunteers)
- `status` (`pending` | `accepted` | `done` | `stuck`)

---

## Environment Variables

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key

# WhatsApp
WA_PHONE_NUMBER_ID=123456789
WA_ACCESS_TOKEN=your-token
WA_VERIFY_TOKEN=my-secret-token

# LLM
LLM_PROVIDER=gemini  # or 'groq'
GEMINI_API_KEY=your-key
GROQ_API_KEY=your-key

# Admin
ADMIN_PHONE=919999999999

# Server
PORT=3000
```

---

## Extending the MVP

### Add Volunteer Registration
Create a `/register` endpoint that accepts WhatsApp messages like:
```
REGISTER food,medical 400001
```
Parse and insert into `volunteers` table.

### Add Coordinator Dashboard
Build a simple React app that queries Supabase directly (use RLS policies for security).

### Add Retry Logic
If a volunteer doesn't reply within 5 minutes, dispatch to the next volunteer.

### Add Analytics
Query Supabase for:
- Total needs resolved
- Top volunteers by impact
- Average response time

### Add Multi-Language Support
Modify `extractNeedSignal()` to detect language and translate prompts.

---

## Troubleshooting

### Webhook not receiving messages
- Check Meta webhook URL is correct
- Verify token matches `WA_VERIFY_TOKEN` in `.env`
- Check Render logs: `render.com → your-app → Logs`

### LLM extraction failing
- Check API key is valid
- Check rate limits (Gemini: 60 req/min free, Groq: 30 req/min free)
- Add error handling in `services.js`

### Volunteers not matching
- Ensure volunteer `skills` array includes the extracted category
- Check pincode format (should be 6 digits)
- Query Supabase directly to debug

### WhatsApp messages not sending
- Verify `WA_ACCESS_TOKEN` is still valid (tokens can expire)
- Check phone number format (E.164 without `+`)
- Check Supabase logs for dispatch creation errors

---

## Cost Breakdown (Monthly)

| Service | Free Tier | Cost |
|---------|-----------|------|
| Supabase | 500MB DB, unlimited API calls | $0 |
| Gemini API | 60 req/min | $0 |
| Groq API | 30 req/min | $0 |
| WhatsApp | 1,000 service conversations | $0 |
| Render | 750 compute hours/month | $0 |
| **Total** | | **$0** |

Upgrade to paid only when you hit limits.

---

## License

MIT
