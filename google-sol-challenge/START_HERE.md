# 🚀 START HERE

Welcome to **SEVA-OS** — a zero-interface volunteer dispatch engine built on WhatsApp.

## What You Have

A **complete, production-ready backend system** that:
- Receives disaster relief needs via WhatsApp
- Uses AI to extract structured data
- Matches available volunteers by skill + location
- Dispatches them automatically
- Tracks completion and impact

**Cost: $0** (all free tiers)

---

## 5-Minute Quick Start

### 1. Get API Keys (5 min)
- **Supabase**: https://supabase.com (create project)
- **Gemini**: https://aistudio.google.com/app/apikey (create key)
- **WhatsApp**: https://developers.facebook.com (create app)

### 2. Setup (2 min)
```bash
npm install
cp .env.example .env
# Fill .env with your API keys
```

### 3. Run Locally (1 min)
```bash
npm start
# Server running on http://localhost:3000
```

### 4. Test (1 min)
```bash
node test-webhook.js verify
node test-webhook.js coordinator "Food needed at 400001"
node test-webhook.js volunteer "YES"
```

### 5. Deploy (1 min)
```bash
git push origin main
# Follow DEPLOYMENT.md for Render setup
```

---

## Documentation Map

**Choose your path:**

### 🎯 I want to understand the project
→ Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) (5 min)

### 🚀 I want to run it locally
→ Follow [QUICKSTART.md](./QUICKSTART.md) (30 min)

### 🌐 I want to deploy to production
→ Follow [DEPLOYMENT.md](./DEPLOYMENT.md) (1 hour)

### 🏗️ I want to understand the architecture
→ Read [ARCHITECTURE.md](./ARCHITECTURE.md) (15 min)

### ❓ I have questions
→ Check [FAQ.md](./FAQ.md)

### 📋 I want a checklist
→ Use [CHECKLIST.md](./CHECKLIST.md)

### 🗺️ I want to navigate everything
→ See [INDEX.md](./INDEX.md)

### 💻 I want command reference
→ Check [COMMANDS.md](./COMMANDS.md)

---

## How It Works (30 seconds)

```
Coordinator sends WhatsApp message
    ↓
"Food needed at 400001"
    ↓
Server extracts: { category: "food", pincode: "400001", urgency: "high" }
    ↓
Finds 3 available volunteers with "food" skill
    ↓
Sends WhatsApp alerts to each
    ↓
Volunteer replies "YES"
    ↓
Server marks as accepted, sends confirmation
    ↓
Volunteer completes task, replies "DONE"
    ↓
Server marks as done, increments impact score
    ↓
✅ Task complete, volunteer back available
```

---

## What's Included

### 💻 Code (650 lines)
- `index.js` — Express server + webhook + state machine
- `services.js` — LLM extraction + WhatsApp API
- `logger.js` — Structured logging
- `admin-cli.js` — Admin command-line tool
- `test-webhook.js` — Local testing

### 🗄️ Database
- `schema.sql` — PostgreSQL schema (run in Supabase)

### 📚 Documentation (8 files)
- Complete guides for setup, deployment, architecture
- FAQ with 50+ questions answered
- Troubleshooting guides
- Command reference

### ⚙️ Configuration
- `package.json` — All dependencies
- `.env.example` — Environment template
- `.gitignore` — Git rules
- GitHub Actions CI/CD

---

## Tech Stack

| Component | Technology | Free Tier |
|-----------|-----------|-----------|
| Server | Node.js + Express | ✅ |
| Database | Supabase (PostgreSQL) | ✅ 500MB |
| AI | Gemini or Groq | ✅ 60 req/min |
| Messaging | WhatsApp Cloud API | ✅ 1,000 msgs/mo |
| Hosting | Render | ✅ 750 hrs/mo |

**Total Cost: $0**

---

## Key Commands

```bash
# Development
npm start                    # Start server
npm run dev                  # Start with auto-reload

# Testing
node test-webhook.js verify  # Test webhook
node test-webhook.js coordinator "message"  # Simulate coordinator
node test-webhook.js volunteer "YES"        # Simulate volunteer

# Admin
node admin-cli.js register   # Register volunteer
node admin-cli.js stats      # Show statistics
node admin-cli.js top        # Top volunteers

# Deployment
git push origin main         # Deploy to Render
```

---

## Next Steps

1. **Read** [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) — Understand what you've built
2. **Follow** [QUICKSTART.md](./QUICKSTART.md) — Get running locally
3. **Deploy** [DEPLOYMENT.md](./DEPLOYMENT.md) — Deploy to production
4. **Verify** [CHECKLIST.md](./CHECKLIST.md) — Ensure everything works
5. **Customize** — Modify code to fit your needs
6. **Scale** — Upgrade services as you grow

---

## Support

- **Questions?** Check [FAQ.md](./FAQ.md)
- **Stuck?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) → Troubleshooting
- **Want details?** Check [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Need commands?** Check [COMMANDS.md](./COMMANDS.md)
- **Lost?** Check [INDEX.md](./INDEX.md)

---

## You're Ready! 🎉

You have a complete, production-ready volunteer dispatch system.

**Start with [QUICKSTART.md](./QUICKSTART.md) →**

---

*Built with Node.js, Supabase, Gemini, WhatsApp, and Render. Zero cost. Maximum impact.*
