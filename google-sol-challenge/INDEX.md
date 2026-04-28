# SEVA-OS: Complete Project Index

## 📚 Documentation

Start here based on your needs:

### For First-Time Users
1. **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** — What you've built, quick overview
2. **[QUICKSTART.md](./QUICKSTART.md)** — Get running in 5 minutes
3. **[README.md](./README.md)** — Full documentation and API reference

### For Deployment
1. **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Production deployment guide (Render, Vercel, self-hosted)
2. **[CHECKLIST.md](./CHECKLIST.md)** — Pre-deployment checklist

### For Understanding the System
1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** — System design, data flows, database schema
2. **[FAQ.md](./FAQ.md)** — Frequently asked questions

---

## 💻 Source Code

### Core Server
- **[index.js](./index.js)** — Express server, webhook handler, state machine (400 lines)
- **[services.js](./services.js)** — LLM extraction, WhatsApp API calls (200 lines)
- **[logger.js](./logger.js)** — Structured logging to console and file (50 lines)

### Admin & Testing
- **[admin-cli.js](./admin-cli.js)** — Command-line admin tool (register, list, stats, etc.)
- **[test-webhook.js](./test-webhook.js)** — Local webhook testing utility

### Configuration
- **[package.json](./package.json)** — Dependencies and npm scripts
- **[.env.example](./.env.example)** — Environment variables template
- **[.gitignore](./.gitignore)** — Git ignore rules

### Database
- **[schema.sql](./schema.sql)** — PostgreSQL schema (run in Supabase)

### CI/CD
- **[.github/workflows/lint.yml](./.github/workflows/lint.yml)** — GitHub Actions workflow

---

## 🚀 Quick Commands

### Local Development
```bash
npm install              # Install dependencies
npm start                # Start server (port 3000)
npm run dev              # Start with auto-reload (nodemon)
```

### Testing
```bash
node test-webhook.js verify                              # Test webhook verification
node test-webhook.js coordinator "Food needed at 400001" # Simulate coordinator
node test-webhook.js volunteer "YES"                     # Simulate volunteer reply
```

### Admin
```bash
node admin-cli.js register    # Register new volunteer
node admin-cli.js list        # List all volunteers
node admin-cli.js needs       # List all needs
node admin-cli.js dispatches  # List recent dispatches
node admin-cli.js stats       # Show system statistics
node admin-cli.js top         # Show top volunteers
node admin-cli.js reset       # Reset volunteer status
```

### Deployment
```bash
git push origin main     # Push to GitHub (triggers Render deployment)
```

---

## 📋 File Structure

```
seva-os/
├── 📄 Documentation
│   ├── INDEX.md                 ← You are here
│   ├── PROJECT_SUMMARY.md       ← Project overview
│   ├── QUICKSTART.md            ← 5-minute setup
│   ├── README.md                ← Full documentation
│   ├── DEPLOYMENT.md            ← Production deployment
│   ├── ARCHITECTURE.md          ← System design
│   ├── CHECKLIST.md             ← Pre-deployment checklist
│   └── FAQ.md                   ← Frequently asked questions
│
├── 💻 Source Code
│   ├── index.js                 ← Express server + webhook + state machine
│   ├── services.js              ← LLM extraction + WhatsApp API
│   ├── logger.js                ← Structured logging
│   ├── admin-cli.js             ← Admin command-line tool
│   └── test-webhook.js          ← Local webhook testing
│
├── 🗄️ Database
│   └── schema.sql               ← PostgreSQL schema
│
├── ⚙️ Configuration
│   ├── package.json             ← Dependencies + scripts
│   ├── .env.example             ← Environment variables template
│   └── .gitignore               ← Git ignore rules
│
└── 🔄 CI/CD
    └── .github/workflows/lint.yml ← GitHub Actions workflow
```

---

## 🎯 Getting Started Paths

### Path 1: I want to understand the project (15 minutes)
1. Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
2. Skim [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Check [FAQ.md](./FAQ.md) for common questions

### Path 2: I want to run it locally (30 minutes)
1. Follow [QUICKSTART.md](./QUICKSTART.md)
2. Get API keys (Supabase, Gemini, WhatsApp)
3. Run `npm install && npm start`
4. Test with `node test-webhook.js`

### Path 3: I want to deploy to production (1 hour)
1. Follow [QUICKSTART.md](./QUICKSTART.md) locally first
2. Push to GitHub
3. Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
4. Use [CHECKLIST.md](./CHECKLIST.md) to verify

### Path 4: I want to extend/customize (varies)
1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system
2. Modify code in `index.js`, `services.js`, etc.
3. Test locally with `node test-webhook.js`
4. Deploy with `git push origin main`

---

## 🔑 Key Concepts

### Coordinator
- Sends needs via WhatsApp (e.g., "Food needed at 400001")
- Receives confirmation when volunteer accepts
- Can contact volunteer directly

### Volunteer
- Registered in the system with skills and location
- Receives dispatch alerts via WhatsApp
- Replies with YES/NO/DONE/STUCK
- Earns impact points for completed tasks

### Need
- A request from a coordinator
- Extracted into structured data (category, pincode, urgency)
- Matched to available volunteers
- Tracked until resolved

### Dispatch
- Assignment of a need to a volunteer
- Tracks status: pending → accepted → done (or stuck)
- Links needs and volunteers

### State Machine
- Volunteer replies trigger state transitions
- YES: pending → accepted
- DONE: accepted → done
- STUCK: accepted → stuck
- NO: pending → stuck

---

## 📊 Technology Stack

| Layer | Technology | Free Tier |
|-------|-----------|-----------|
| Server | Node.js + Express | ✅ |
| Database | Supabase (PostgreSQL) | ✅ 500MB |
| LLM | Gemini or Groq | ✅ 60 req/min |
| Messaging | Meta WhatsApp Cloud API | ✅ 1,000 msgs/mo |
| Hosting | Render or Vercel | ✅ 750 hrs/mo |
| Logging | File-based JSON logs | ✅ |
| Admin | CLI tool | ✅ |

**Total Cost: $0** (until you scale)

---

## 🎓 Learning Resources

### Understanding the Code
- Start with [index.js](./index.js) — main server logic
- Then [services.js](./services.js) — external API calls
- Then [logger.js](./logger.js) — logging utility
- Then [admin-cli.js](./admin-cli.js) — admin commands

### Understanding the System
- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for data flows
- Check [schema.sql](./schema.sql) for database structure
- Review [README.md](./README.md) for API reference

### Understanding Deployment
- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for options
- Follow [CHECKLIST.md](./CHECKLIST.md) step-by-step
- Check [FAQ.md](./FAQ.md) for troubleshooting

---

## 🐛 Troubleshooting

### Common Issues
1. **Webhook not receiving messages** → Check [DEPLOYMENT.md](./DEPLOYMENT.md) → Troubleshooting
2. **LLM extraction failing** → Check [FAQ.md](./FAQ.md) → Error Handling
3. **Volunteers not matching** → Check [ARCHITECTURE.md](./ARCHITECTURE.md) → Database Schema
4. **WhatsApp messages not sending** → Check [FAQ.md](./FAQ.md) → Communication

### Getting Help
1. Check [FAQ.md](./FAQ.md) for your question
2. Check logs: `tail -f logs/error.log`
3. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
4. Open an issue on GitHub

---

## 📈 Scaling Path

### MVP (Free Tier)
- <100 volunteers
- <1,000 needs/month
- All services on free tier
- Cost: $0

### Growth (Paid Tier)
- 100–1,000 volunteers
- 1,000–10,000 needs/month
- Upgrade Render ($7/mo) + Supabase ($25/mo)
- Cost: $32/mo

### Scale (Enterprise)
- >1,000 volunteers
- >10,000 needs/month
- Dedicated infrastructure
- Cost: $100–$1,000/mo

---

## 🎯 Next Steps

1. **Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** — Understand what you've built
2. **Follow [QUICKSTART.md](./QUICKSTART.md)** — Get running locally
3. **Follow [DEPLOYMENT.md](./DEPLOYMENT.md)** — Deploy to production
4. **Use [CHECKLIST.md](./CHECKLIST.md)** — Verify everything works
5. **Customize** — Modify code to fit your needs
6. **Scale** — Upgrade services as you grow

---

## 📞 Support

- **Documentation**: See files listed above
- **FAQ**: [FAQ.md](./FAQ.md)
- **Troubleshooting**: [DEPLOYMENT.md](./DEPLOYMENT.md) → Troubleshooting
- **Issues**: Open an issue on GitHub
- **Contributions**: Fork and submit a pull request

---

## 📄 License

MIT

---

## 🚀 You're Ready!

You have a complete, production-ready volunteer dispatch system. Start with [QUICKSTART.md](./QUICKSTART.md) and deploy with [DEPLOYMENT.md](./DEPLOYMENT.md).

Good luck! 🎉
