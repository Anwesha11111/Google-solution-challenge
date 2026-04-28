# SEVA-OS Deployment Checklist

## Pre-Deployment

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`

## Get API Keys

### Supabase
- [ ] Create account at [supabase.com](https://supabase.com)
- [ ] Create new project
- [ ] Copy Project URL → `SUPABASE_URL`
- [ ] Copy Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Run `schema.sql` in SQL Editor
- [ ] Verify tables created: `volunteers`, `needs`, `dispatches`

### Gemini (LLM)
- [ ] Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- [ ] Create API Key
- [ ] Copy → `GEMINI_API_KEY`
- [ ] Test: `node test-webhook.js verify`

### WhatsApp
- [ ] Go to [developers.facebook.com](https://developers.facebook.com)
- [ ] Create app → WhatsApp
- [ ] Copy Phone Number ID → `WA_PHONE_NUMBER_ID`
- [ ] Copy Access Token → `WA_ACCESS_TOKEN`
- [ ] Generate random string → `WA_VERIFY_TOKEN`
- [ ] Set webhook URL (after deployment)

## Local Testing

- [ ] Fill `.env` with all keys
- [ ] Run `npm start`
- [ ] Test webhook verification: `node test-webhook.js verify`
- [ ] Test coordinator message: `node test-webhook.js coordinator "Food needed at 400001"`
- [ ] Test volunteer reply: `node test-webhook.js volunteer "YES"`
- [ ] Register test volunteer: `node admin-cli.js register`
- [ ] View stats: `node admin-cli.js stats`

## Deploy to Render

- [ ] Push code to GitHub
- [ ] Go to [render.com](https://render.com)
- [ ] Create new Web Service
- [ ] Connect GitHub repo
- [ ] Set build command: `npm install`
- [ ] Set start command: `node index.js`
- [ ] Add all environment variables
- [ ] Deploy
- [ ] Copy deployment URL

## Configure WhatsApp Webhook

- [ ] Go to Meta Developers → Your App → WhatsApp → Configuration
- [ ] Set Webhook URL: `https://your-app-name.onrender.com/webhook/whatsapp`
- [ ] Set Verify Token: (use your `WA_VERIFY_TOKEN`)
- [ ] Click "Verify and Save"
- [ ] Verify webhook shows "Active"

## Post-Deployment

- [ ] Test health check: `curl https://your-app.onrender.com/health`
- [ ] Send test WhatsApp message to your bot number
- [ ] Verify message received in Render logs
- [ ] Register test volunteer: `node admin-cli.js register`
- [ ] Send another test message
- [ ] Verify volunteer receives alert
- [ ] Test volunteer reply (YES/DONE/STUCK)
- [ ] Verify database updates

## Monitoring

- [ ] Check Render logs regularly
- [ ] Monitor error rate
- [ ] Check volunteer response times
- [ ] Track total impact (lives helped)
- [ ] Review reliability scores

## Scaling (When Needed)

- [ ] Monitor Gemini API rate limits (60 req/min)
- [ ] Monitor WhatsApp message quota (1,000/month)
- [ ] Monitor Supabase storage (500MB free)
- [ ] Monitor Render compute hours (750/month)
- [ ] Upgrade services as needed

## Maintenance

- [ ] Review logs weekly
- [ ] Update dependencies monthly: `npm update`
- [ ] Backup database (Supabase auto-backs up)
- [ ] Monitor volunteer reliability scores
- [ ] Remove inactive volunteers (optional)

## Optional Enhancements

- [ ] Add volunteer registration flow
- [ ] Build coordinator dashboard
- [ ] Add retry logic for no-response
- [ ] Add analytics dashboard
- [ ] Add multi-language support
- [ ] Add geolocation matching
- [ ] Add volunteer ratings
- [ ] Add SMS fallback (Twilio)

---

## Troubleshooting

### Webhook not receiving messages
- [ ] Check webhook URL in Meta dashboard
- [ ] Check verify token matches
- [ ] Check Render logs for errors
- [ ] Verify app is in production mode

### LLM extraction failing
- [ ] Check API key is valid
- [ ] Check rate limits
- [ ] Check error logs

### Volunteers not matching
- [ ] Check volunteer skills include category
- [ ] Check pincode format (6 digits)
- [ ] Query database directly

### WhatsApp messages not sending
- [ ] Check access token is valid
- [ ] Check phone number format (E.164)
- [ ] Check Supabase logs

---

## Support Resources

- [README.md](./README.md) — Full documentation
- [QUICKSTART.md](./QUICKSTART.md) — 5-minute setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Production deployment
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) — Project overview

---

## Success Criteria

✅ Server running on Render  
✅ Webhook receiving messages  
✅ Volunteers registered  
✅ Dispatches working  
✅ Replies being processed  
✅ Database updating correctly  
✅ Logs showing activity  
✅ Admin CLI working  

You're ready to go live! 🚀
