# SEVA-OS: Project Summary

## What You've Built

A **zero-interface, zero-cost volunteer dispatch engine** that runs entirely on WhatsApp. No frontend. No credit card. Just pure backend magic.

### Core Features

✅ **Coordinator Interface**: Send needs via WhatsApp → LLM extracts structured data  
✅ **Volunteer Matching**: Automatically finds available volunteers by skill + location  
✅ **Dispatch System**: Sends alerts to top 3 volunteers, waits for YES/NO  
✅ **State Machine**: Handles YES/NO/DONE/STUCK replies with automatic status updates  
✅ **Impact Tracking**: Increments volunteer scores on task completion  
✅ **Reliability Scoring**: Penalizes volunteers who get stuck  
✅ **Admin CLI**: Register volunteers, view stats, manage system  
✅ **Structured Logging**: JSON logs for debugging and monitoring  

---

## File Structure

```
seva-os/
├── index.js                 # Express server + webhook handler + state machine
├── services.js              # LLM extraction + WhatsApp API calls
├── logger.js                # Structured logging (console + file)
├── admin-cli.js             # Command-line admin tool
├── test-webhook.js          # Local webhook testing
├── schema.sql               # Database schema (run in Supabase)
├── package.json             # Dependencies + scripts
├── .env.example             # Environment variables template
├── README.md                # Full documentation
├── QUICKSTART.md            # 5-minute setup guide
├── DEPLOYMENT.md            # Production deployment guide
├── ARCHITECTURE.md          # System design + data flows
└── PROJECT_SUMMARY.md       # This file
```

---

## Technology Stack

| Layer | Technology | Free Tier |
|-------|-----------|-----------|
| **Server** | Node.js + Express | ✅ |
| **Database** | Supabase (PostgreSQL) | ✅ 500MB |
| **LLM** | Gemini or Groq | ✅ 60 req/min |
| **Messaging** | Meta WhatsApp Cloud API | ✅ 1,000 msgs/mo |
| **Hosting** | Render or Vercel | ✅ 750 hrs/mo |
| **Logging** | File-based JSON logs | ✅ |
| **Admin** | CLI tool | ✅ |

**Total Cost: $0** (until you scale)

---

## Quick Start (5 Minutes)

```bash
# 1. Clone & install
git clone <repo>
cd seva-os
npm install
cp .env.example .env

# 2. Get API keys (Supabase, Gemini, WhatsApp)
# 3. Fill .env with your keys
# 4. Run schema.sql in Supabase
# 5. Start server
npm start

# 6. Test locally
node test-webhook.js verify
node test-webhook.js coordinator "Food needed at 400001"
node test-webhook.js volunteer "YES"

# 7. Deploy to Render
git push origin main
# (Follow DEPLOYMENT.md)
```

See [QUICKSTART.md](./QUICKSTART.md) for detailed steps.

---

## How It Works

### Coordinator Sends a Need
```
Coordinator: "Food needed at 400001"
    ↓
Server extracts: { category: "food", pincode: "400001", urgency: "high" }
    ↓
Finds 3 available volunteers with "food" skill in pincode 400001
    ↓
Sends WhatsApp alerts to each volunteer
```

### Volunteer Replies
```
Volunteer: "YES"
    ↓
Server marks dispatch as "accepted"
    ↓
Sends confirmation with coordinator contact
    ↓
Volunteer is now "busy"

Volunteer: "DONE"
    ↓
Server marks dispatch as "done"
    ↓
Increments volunteer's impact score
    ↓
Volunteer is back "available"

Volunteer: "STUCK"
    ↓
Server alerts admin
    ↓
Decrements volunteer's reliability score
    ↓
Volunteer is back "available"
```

---

## API Reference

### Webhook: POST /webhook/whatsapp
Receives all incoming WhatsApp messages. Automatically routes:
- **Coordinator message** → Extract need → Dispatch
- **Volunteer YES** → Accept task
- **Volunteer NO** → Decline task
- **Volunteer DONE** → Complete task
- **Volunteer STUCK** → Alert admin

### Health Check: GET /health
```bash
curl https://your-app.onrender.com/health
# { "status": "ok", "service": "SEVA-OS", "timestamp": "..." }
```

### Admin CLI
```bash
node admin-cli.js register    # Register new volunteer
node admin-cli.js list        # List all volunteers
node admin-cli.js needs       # List all needs
node admin-cli.js dispatches  # List recent dispatches
node admin-cli.js stats       # Show system statistics
node admin-cli.js top         # Show top volunteers
node admin-cli.js reset       # Reset volunteer status
```

---

## Database Schema

### volunteers
- `id` (UUID)
- `phone_number` (E.164, e.g., 919876543210)
- `pincode` (6-digit area code)
- `skills` (array: food, medical, shelter, safety)
- `status` (available | busy)
- `reliability_score` (0–100, starts at 100)
- `total_impact` (incremented on DONE)

### needs
- `id` (UUID)
- `original_text` (raw coordinator message)
- `category` (food | medical | shelter | safety)
- `pincode` (extracted or defaulted)
- `urgency` (high | low)
- `status` (open | dispatched | resolved)

### dispatches
- `id` (UUID)
- `need_id` (FK to needs)
- `volunteer_id` (FK to volunteers)
- `status` (pending | accepted | done | stuck)

---

## Deployment Options

### Render (Recommended)
- Free tier: 750 compute hours/month
- Auto-deploys from GitHub
- No cold start penalty on paid tier
- See [DEPLOYMENT.md](./DEPLOYMENT.md)

### Vercel (Serverless)
- Free tier: 100GB bandwidth/month
- No cold starts
- Better for high-traffic scenarios

### Self-Hosted
- DigitalOcean, AWS EC2, etc.
- Full control
- More setup required

---

## Extending the MVP

### Add Volunteer Registration
Create a `/register` endpoint that accepts WhatsApp messages like:
```
REGISTER food,medical 400001
```

### Add Coordinator Dashboard
Build a React app that queries Supabase directly (use RLS policies).

### Add Retry Logic
If a volunteer doesn't reply within 5 minutes, dispatch to the next volunteer.

### Add Analytics
Query Supabase for:
- Total needs resolved
- Top volunteers by impact
- Average response time
- Volunteer utilization rate

### Add Multi-Language Support
Modify `extractNeedSignal()` to detect language and translate prompts.

### Add Geolocation
Use PostGIS in Supabase for distance-based matching instead of pincode.

### Add Ratings
Let coordinators rate volunteers after task completion.

---

## Monitoring & Logs

### Local Logs
```bash
tail -f logs/info.log      # View info logs
tail -f logs/error.log     # View errors
```

### Render Logs
- Dashboard → Logs tab
- Real-time streaming

### Key Metrics
- Needs created per hour
- Dispatch success rate
- Volunteer response time
- Volunteer completion rate
- LLM extraction accuracy

---

## Troubleshooting

### Webhook not receiving messages
- Check webhook URL in Meta dashboard
- Verify token matches `WA_VERIFY_TOKEN`
- Check Render logs

### LLM extraction failing
- Check API key validity
- Check rate limits (Gemini: 60 req/min)
- Add error handling in `services.js`

### Volunteers not matching
- Ensure volunteer skills include extracted category
- Check pincode format (6 digits)
- Query Supabase directly to debug

### WhatsApp messages not sending
- Verify `WA_ACCESS_TOKEN` is valid
- Check phone number format (E.164 without `+`)
- Check Supabase logs

---

## Cost Breakdown (Monthly)

| Service | Free Tier | Paid Tier | Cost |
|---------|-----------|-----------|------|
| Supabase | 500MB | 8GB | $0–$25 |
| Render | 750 hrs | Unlimited | $0–$7 |
| Gemini | 60 req/min | Unlimited | $0–$5 |
| WhatsApp | 1,000 msgs | Pay-per-msg | $0–$50 |
| **Total** | | | **$0–$87** |

For an MVP with <100 volunteers, stay on free tier.

---

## Next Steps

1. **Read [QUICKSTART.md](./QUICKSTART.md)** — Get running in 5 minutes
2. **Read [DEPLOYMENT.md](./DEPLOYMENT.md)** — Deploy to production
3. **Read [ARCHITECTURE.md](./ARCHITECTURE.md)** — Understand the system
4. **Customize** — Modify message templates, add features
5. **Scale** — Upgrade services as you grow

---

## Support

- Check [README.md](./README.md) for full documentation
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Check logs in `./logs/` for debugging
- Use `node admin-cli.js` for system management

---

## License

MIT

---

## Credits

Built with:
- Node.js + Express
- Supabase (PostgreSQL)
- Google Gemini API
- Meta WhatsApp Cloud API
- Render (hosting)

Zero-budget MVP for disaster relief coordination. 🚀
