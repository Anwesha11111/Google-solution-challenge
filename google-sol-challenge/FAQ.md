# SEVA-OS FAQ

## General Questions

### Q: What is SEVA-OS?
A: A zero-interface volunteer dispatch engine that runs entirely on WhatsApp. Coordinators send needs via WhatsApp, the system extracts structured data using AI, matches available volunteers, and dispatches them. All communication happens via WhatsApp.

### Q: Why "zero-interface"?
A: There's no web app, mobile app, or dashboard. Everything happens through WhatsApp messages. This makes it accessible to anyone with a phone, even in low-bandwidth areas.

### Q: How much does it cost?
A: $0 for the MVP. All services used have generous free tiers:
- Supabase: 500MB free
- Gemini API: 60 requests/min free
- WhatsApp: 1,000 service conversations/month free
- Render: 750 compute hours/month free

### Q: Can I use this for production?
A: Yes, but start with the free tier and upgrade as you scale. The architecture is designed to handle 100+ volunteers without issues.

### Q: How long does it take to set up?
A: 5 minutes if you have API keys ready. See [QUICKSTART.md](./QUICKSTART.md).

---

## Technical Questions

### Q: What's the tech stack?
A: Node.js + Express (server), Supabase/PostgreSQL (database), Gemini/Groq (LLM), Meta WhatsApp Cloud API (messaging), Render (hosting).

### Q: Can I use a different LLM?
A: Yes. Modify `services.js` to call any LLM API (OpenAI, Claude, etc.). The extraction logic is modular.

### Q: Can I use a different database?
A: Yes. Replace Supabase with any PostgreSQL-compatible database. The schema is standard SQL.

### Q: Can I host this on AWS/GCP/Azure?
A: Yes. The code is cloud-agnostic. Just deploy the Node.js server and connect to your database.

### Q: How do I add a frontend?
A: Build a React/Vue app that queries Supabase directly. Use RLS (Row Level Security) policies to control access.

### Q: Can I add SMS support?
A: Yes. Add Twilio integration in `services.js` to send SMS in addition to WhatsApp.

### Q: How do I handle offline volunteers?
A: The system assumes volunteers have WhatsApp. For offline scenarios, add a fallback (SMS, email, etc.).

---

## Deployment Questions

### Q: Which hosting platform should I use?
A: **Render** (recommended for free tier) or **Vercel** (for serverless). See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

### Q: What's a "cold start"?
A: When a server hasn't been used for a while, it takes 30 seconds to start up. Render free tier has this. Upgrade to paid tier to avoid it.

### Q: How do I set up the webhook?
A: 
1. Deploy your app to Render
2. Copy the URL (e.g., `https://my-app.onrender.com`)
3. Go to Meta Developers → WhatsApp → Configuration
4. Set webhook URL: `https://my-app.onrender.com/webhook/whatsapp`
5. Set verify token (any random string)
6. Click "Verify and Save"

### Q: How do I monitor the server?
A: Check Render logs in the dashboard. Logs are also written to `./logs/` directory locally.

### Q: How do I scale to 1,000 volunteers?
A: Upgrade Supabase to Pro ($25/mo), upgrade Render to Standard ($7/mo), and increase LLM rate limits.

---

## Database Questions

### Q: How do I back up my data?
A: Supabase auto-backs up daily. Go to Supabase dashboard → Backups → Restore if needed.

### Q: How do I query the database?
A: Use Supabase dashboard → SQL Editor, or use the Supabase client in code.

### Q: Can I export data?
A: Yes. Go to Supabase dashboard → Data → Export as CSV.

### Q: How do I add a new column?
A: Go to Supabase dashboard → SQL Editor → Run ALTER TABLE command.

### Q: What if I hit the 500MB storage limit?
A: Upgrade to Supabase Pro ($25/mo) for 8GB storage.

---

## Volunteer Management Questions

### Q: How do I register volunteers?
A: Use the admin CLI:
```bash
node admin-cli.js register
```
Or build a registration flow that accepts WhatsApp messages.

### Q: How do I remove a volunteer?
A: Use Supabase dashboard → Data → Delete row, or add a DELETE endpoint.

### Q: How do I track volunteer performance?
A: Use the admin CLI:
```bash
node admin-cli.js stats
node admin-cli.js top
```

### Q: What's the reliability score?
A: Starts at 100. Decremented by 10 when a volunteer replies "STUCK". Used for prioritizing volunteers in dispatch.

### Q: What's the impact score?
A: Incremented by 1 each time a volunteer completes a task (replies "DONE"). Used for leaderboards and recognition.

### Q: Can I manually adjust scores?
A: Yes. Use Supabase dashboard → Data → Edit row directly.

---

## Message & Communication Questions

### Q: What messages do volunteers receive?
A: 
- Dispatch alert: "🚨 SEVA-OS ALERT: Need: FOOD at pincode 400001. Reply YES to accept."
- Acceptance confirmation: "✅ Assignment accepted! Task: FOOD at 400001. Coordinator: +91-XXXXX-XXXXX"
- Thank you: "🙏 Thank you! Your impact has been logged."
- Stuck alert: "⚠️ Got it. We've alerted the coordinator. Hang tight — help is on the way."

### Q: Can I customize messages?
A: Yes. Edit the message templates in `services.js`.

### Q: Can I add emojis?
A: Yes. WhatsApp supports emojis. Add them to message templates.

### Q: Can I send images/videos?
A: Yes. Modify `sendWhatsAppMessage()` to send media instead of text.

### Q: What if a volunteer doesn't reply?
A: The system waits indefinitely. Add retry logic if needed (dispatch to next volunteer after 5 minutes).

---

## Error Handling Questions

### Q: What happens if the LLM API fails?
A: The error is logged and the webhook silently fails. The coordinator doesn't get feedback but can retry.

### Q: What happens if WhatsApp API fails?
A: The error is logged. Meta will retry the webhook, so the message will be reprocessed.

### Q: What happens if the database is down?
A: The server crashes. Render will automatically restart it.

### Q: How do I debug errors?
A: Check logs:
```bash
tail -f logs/error.log
tail -f logs/info.log
```

### Q: How do I report a bug?
A: Check the logs, then open an issue on GitHub with:
- Error message
- Steps to reproduce
- Environment (Render, local, etc.)

---

## Scaling Questions

### Q: When should I upgrade Supabase?
A: When you hit 500MB storage or need better performance. Upgrade to Pro ($25/mo).

### Q: When should I upgrade Render?
A: When you hit 750 compute hours/month or want to avoid cold starts. Upgrade to Standard ($7/mo).

### Q: When should I upgrade the LLM?
A: When you hit 60 requests/min (Gemini) or 30 requests/min (Groq). Switch to paid tier or use a different LLM.

### Q: When should I upgrade WhatsApp?
A: When you hit 1,000 service conversations/month. Switch to pay-per-message model.

### Q: How do I handle 10,000 volunteers?
A: You'll need:
- Supabase Pro ($25/mo)
- Render Standard ($7/mo)
- Paid LLM tier ($5–$50/mo)
- Paid WhatsApp tier ($50–$500/mo)
- Possibly a CDN for faster responses

---

## Security Questions

### Q: Is my data secure?
A: Yes. Supabase uses encryption at rest and in transit. WhatsApp uses end-to-end encryption.

### Q: Who can see my data?
A: Only people with Supabase credentials. Use RLS (Row Level Security) policies to restrict access.

### Q: How do I prevent unauthorized access?
A: 
- Keep API keys secret (use `.env`)
- Use Supabase RLS policies
- Add rate limiting (optional)
- Add request signing (optional)

### Q: Can I encrypt sensitive data?
A: Yes. Add encryption in the application layer before storing in Supabase.

### Q: What about GDPR compliance?
A: Supabase is GDPR-compliant. You're responsible for:
- Getting consent from volunteers
- Allowing data deletion
- Documenting data usage

---

## Troubleshooting Questions

### Q: Webhook not receiving messages
A: 
1. Check webhook URL in Meta dashboard
2. Check verify token matches `WA_VERIFY_TOKEN`
3. Check Render logs for errors
4. Verify app is in production mode

### Q: LLM extraction failing
A:
1. Check API key is valid
2. Check rate limits (Gemini: 60 req/min)
3. Check error logs
4. Try a simpler message

### Q: Volunteers not matching
A:
1. Check volunteer skills include category
2. Check pincode format (6 digits)
3. Query database directly
4. Check volunteer status is "available"

### Q: WhatsApp messages not sending
A:
1. Check access token is valid
2. Check phone number format (E.164 without `+`)
3. Check Supabase logs
4. Verify app is in production mode

### Q: Server keeps crashing
A:
1. Check Render logs
2. Check database connection
3. Check API key validity
4. Increase error handling

---

## Feature Request Questions

### Q: Can I add a web dashboard?
A: Yes. Build a React app that queries Supabase. See [ARCHITECTURE.md](./ARCHITECTURE.md).

### Q: Can I add volunteer ratings?
A: Yes. Add a `ratings` table and modify the dispatch logic to consider ratings.

### Q: Can I add geolocation matching?
A: Yes. Use PostGIS in Supabase for distance-based matching instead of pincode.

### Q: Can I add multi-language support?
A: Yes. Modify `extractNeedSignal()` to detect language and translate prompts.

### Q: Can I add SMS support?
A: Yes. Add Twilio integration in `services.js`.

### Q: Can I add email notifications?
A: Yes. Add SendGrid or similar in `services.js`.

---

## Cost Questions

### Q: Why is it free?
A: All services used have generous free tiers designed for startups and MVPs.

### Q: When do I start paying?
A: When you exceed free tier limits:
- Supabase: >500MB storage
- Gemini: >60 requests/min
- WhatsApp: >1,000 service conversations/month
- Render: >750 compute hours/month

### Q: What's the cheapest way to scale?
A: Upgrade services incrementally:
1. Render Standard ($7/mo) — no cold starts
2. Supabase Pro ($25/mo) — more storage
3. Paid LLM tier ($5–$50/mo) — higher rate limits
4. Paid WhatsApp tier ($50–$500/mo) — more messages

### Q: Can I reduce costs?
A: Yes:
- Use Groq instead of Gemini (faster, same free tier)
- Batch requests to reduce API calls
- Cache LLM responses
- Use cheaper hosting (self-hosted)

---

## Getting Help

### Q: Where do I find documentation?
A: 
- [README.md](./README.md) — Full documentation
- [QUICKSTART.md](./QUICKSTART.md) — 5-minute setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Production deployment
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) — Project overview

### Q: How do I report a bug?
A: Open an issue on GitHub with:
- Error message
- Steps to reproduce
- Environment details

### Q: How do I request a feature?
A: Open an issue on GitHub with:
- Feature description
- Use case
- Why it's needed

### Q: Can I contribute?
A: Yes! Fork the repo, make changes, and submit a pull request.

---

## Still Have Questions?

Check the documentation files or open an issue on GitHub. We're here to help! 🚀
