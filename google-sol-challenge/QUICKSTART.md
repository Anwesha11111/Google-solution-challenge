# SEVA-OS Quick Start (5 Minutes)

## 1. Clone & Install

```bash
git clone https://github.com/your-username/seva-os.git
cd seva-os
npm install
cp .env.example .env
```

## 2. Get Your API Keys

### Supabase (Database)
1. Go to [supabase.com](https://supabase.com) → Sign up
2. Create a new project
3. Go to Settings → API → Copy:
   - `Project URL` → `SUPABASE_URL`
   - `Service Role Key` → `SUPABASE_SERVICE_ROLE_KEY`
4. Go to SQL Editor → Paste `schema.sql` → Run

### Gemini (LLM)
1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy → `GEMINI_API_KEY`

### WhatsApp (Messaging)
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create an app → WhatsApp
3. Get your:
   - `Phone Number ID` → `WA_PHONE_NUMBER_ID`
   - `Access Token` → `WA_ACCESS_TOKEN`
4. Generate a random string for `WA_VERIFY_TOKEN` (e.g., `my-secret-123`)

## 3. Fill `.env`

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key-here
WA_PHONE_NUMBER_ID=123456789
WA_ACCESS_TOKEN=your-token-here
WA_VERIFY_TOKEN=my-secret-123
GEMINI_API_KEY=your-key-here
ADMIN_PHONE=919999999999
PORT=3000
```

## 4. Run Locally

```bash
npm start
# Server running on http://localhost:3000
```

## 5. Test Locally

In another terminal:

```bash
# Test webhook verification
node test-webhook.js verify

# Simulate coordinator message
node test-webhook.js coordinator "Food needed at 400001"

# Simulate volunteer reply
node test-webhook.js volunteer "YES"
node test-webhook.js volunteer "DONE"
```

## 6. Deploy to Render

```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# Go to render.com → New Web Service
# Connect your GitHub repo
# Add environment variables from .env
# Deploy
```

## 7. Set WhatsApp Webhook

1. Go to Meta Developers → Your App → WhatsApp → Configuration
2. Webhook URL: `https://your-app-name.onrender.com/webhook/whatsapp`
3. Verify Token: (use your `WA_VERIFY_TOKEN`)
4. Click "Verify and Save"

## 8. Register a Test Volunteer

```bash
node admin-cli.js register
# Phone: 919876543210
# Pincode: 400001
# Skills: food,medical
```

## 9. Send a Test Message

Send a WhatsApp message to your bot number:
```
Food needed at 400001
```

The bot will:
1. Extract the need (LLM)
2. Find matching volunteers
3. Send them a dispatch alert
4. Wait for YES/NO/DONE/STUCK

## 10. Monitor

```bash
# View logs
tail -f logs/info.log

# View stats
node admin-cli.js stats

# View top volunteers
node admin-cli.js top
```

---

## Troubleshooting

### "Cannot find module 'dotenv'"
```bash
npm install
```

### "Webhook verification failed"
- Check `WA_VERIFY_TOKEN` matches in Meta dashboard
- Check webhook URL is correct

### "No volunteers found"
```bash
node admin-cli.js register
# Register at least one volunteer
```

### "LLM extraction failed"
- Check `GEMINI_API_KEY` is valid
- Check rate limits (60 req/min free tier)

### "WhatsApp message not sending"
- Check `WA_ACCESS_TOKEN` is valid
- Check phone number format (E.164 without `+`)

---

## Next Steps

- Read [README.md](./README.md) for full documentation
- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
- Customize message templates in `services.js`
- Add volunteer registration flow
- Build a coordinator dashboard

---

## Cost Check

| Service | Free Tier | Status |
|---------|-----------|--------|
| Supabase | 500MB | ✅ Free |
| Gemini | 60 req/min | ✅ Free |
| WhatsApp | 1,000 msgs | ✅ Free |
| Render | 750 hrs/mo | ✅ Free |
| **Total** | | **$0** |

You're running on zero budget. 🎉
