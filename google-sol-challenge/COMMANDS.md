# SEVA-OS Command Reference

## Development Commands

### Start Server
```bash
npm start              # Start server (production mode)
npm run dev            # Start with auto-reload (development mode)
```

### Install Dependencies
```bash
npm install            # Install all dependencies
npm update             # Update all dependencies
```

### Health Check
```bash
curl http://localhost:3000/health
# Response: { "status": "ok", "service": "SEVA-OS", "timestamp": "..." }
```

---

## Testing Commands

### Test Webhook Verification
```bash
node test-webhook.js verify
# Tests Meta webhook handshake
```

### Simulate Coordinator Message
```bash
node test-webhook.js coordinator "Food needed at 400001"
node test-webhook.js coordinator "Medical emergency at 400002"
node test-webhook.js coordinator "Shelter needed at 400003"
```

### Simulate Volunteer Reply
```bash
node test-webhook.js volunteer "YES"
node test-webhook.js volunteer "NO"
node test-webhook.js volunteer "DONE"
node test-webhook.js volunteer "STUCK"
```

### Quick Test Suite
```bash
npm run test:verify                              # Test verification
npm run test:coordinator                         # Test coordinator
npm run test:volunteer                           # Test volunteer
```

---

## Admin Commands

### Register New Volunteer
```bash
node admin-cli.js register
# Interactive prompt:
# Phone: 919876543210
# Pincode: 400001
# Skills: food,medical,shelter,safety
```

### List All Volunteers
```bash
node admin-cli.js list
# Shows: Phone, Pincode, Skills, Status, Reliability, Impact
```

### List All Needs
```bash
node admin-cli.js needs
# Shows: ID, Category, Pincode, Urgency, Status, Created
```

### List Recent Dispatches
```bash
node admin-cli.js dispatches
# Shows: ID, Volunteer, Category, Pincode, Status, Created
```

### Show System Statistics
```bash
node admin-cli.js stats
# Shows:
#   Total Volunteers
#   Total Needs
#   Resolved Needs (%)
#   Total Dispatches
#   Completed Dispatches
#   Total Impact
#   Avg Reliability Score
```

### Show Top Volunteers
```bash
node admin-cli.js top
# Shows: Rank, Phone, Impact, Reliability, Status
```

### Reset Volunteer Status
```bash
node admin-cli.js reset
# Interactive prompt:
# Phone number to reset: 919876543210
# Resets status to "available" and reliability to 100
```

---

## Logging Commands

### View Error Logs
```bash
tail -f logs/error.log
# Real-time error log stream
```

### View Info Logs
```bash
tail -f logs/info.log
# Real-time info log stream
```

### View All Logs
```bash
tail -f logs/debug.log
# Real-time debug log stream (most verbose)
```

### Search Logs
```bash
grep "STUCK" logs/info.log
grep "dispatch" logs/info.log
grep "919876543210" logs/info.log
```

### Count Log Entries
```bash
wc -l logs/info.log
wc -l logs/error.log
```

---

## Database Commands (Supabase)

### Access Supabase Dashboard
```
https://app.supabase.com
→ Select your project
→ SQL Editor
```

### Query Volunteers
```sql
SELECT * FROM volunteers ORDER BY total_impact DESC;
SELECT * FROM volunteers WHERE status = 'available';
SELECT * FROM volunteers WHERE pincode = '400001';
```

### Query Needs
```sql
SELECT * FROM needs ORDER BY created_at DESC;
SELECT * FROM needs WHERE status = 'open';
SELECT * FROM needs WHERE category = 'food';
```

### Query Dispatches
```sql
SELECT * FROM dispatches ORDER BY created_at DESC;
SELECT * FROM dispatches WHERE status = 'pending';
SELECT * FROM dispatches WHERE status = 'done';
```

### Update Volunteer
```sql
UPDATE volunteers SET status = 'available' WHERE phone_number = '919876543210';
UPDATE volunteers SET reliability_score = 100 WHERE phone_number = '919876543210';
UPDATE volunteers SET total_impact = 0 WHERE phone_number = '919876543210';
```

### Delete Volunteer
```sql
DELETE FROM volunteers WHERE phone_number = '919876543210';
```

---

## Deployment Commands

### Push to GitHub
```bash
git add .
git commit -m "Your message"
git push origin main
# Triggers Render deployment automatically
```

### Check Deployment Status
```
https://dashboard.render.com
→ Select your service
→ View logs
```

### View Live Logs
```bash
# In Render dashboard:
# Your Service → Logs tab
# Real-time streaming of server output
```

### Restart Server
```
https://dashboard.render.com
→ Select your service
→ Manual → Restart
```

---

## Environment Setup Commands

### Create .env File
```bash
cp .env.example .env
# Edit .env with your API keys
```

### Verify Environment
```bash
cat .env
# Check all variables are set
```

### Test API Keys
```bash
node test-webhook.js verify
# Tests webhook verification (uses WA_VERIFY_TOKEN)
```

---

## Git Commands

### Initialize Repository
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/seva-os.git
git push -u origin main
```

### View Git Status
```bash
git status
git log --oneline
git diff
```

### Revert Changes
```bash
git revert <commit-hash>
git reset --hard HEAD~1
```

---

## Docker Commands (Optional)

### Build Docker Image
```bash
docker build -t seva-os .
```

### Run Docker Container
```bash
docker run -p 3000:3000 --env-file .env seva-os
```

---

## Performance Monitoring

### Check Server Memory
```bash
# On Render dashboard:
# Your Service → Metrics tab
# View CPU, Memory, Network usage
```

### Monitor API Rate Limits
```bash
# Gemini: 60 requests/minute
# Groq: 30 requests/minute
# WhatsApp: 1,000 service conversations/month
# Check logs for rate limit errors
```

### Check Database Usage
```bash
# Supabase dashboard:
# Settings → Usage
# View storage, bandwidth, API calls
```

---

## Troubleshooting Commands

### Check Server Health
```bash
curl http://localhost:3000/health
# Should return: { "status": "ok", "service": "SEVA-OS" }
```

### Test Webhook Locally
```bash
node test-webhook.js verify
node test-webhook.js coordinator "Test message"
```

### View Recent Errors
```bash
tail -20 logs/error.log
```

### Check Database Connection
```bash
# In Supabase dashboard:
# SQL Editor → Run a simple query
# SELECT 1;
```

### Verify API Keys
```bash
# Check .env file
cat .env | grep -E "SUPABASE|GEMINI|WA_"
```

---

## Cleanup Commands

### Remove Logs
```bash
rm -rf logs/
```

### Remove Node Modules
```bash
rm -rf node_modules/
npm install
```

### Clean Database (Supabase)
```sql
-- Delete all dispatches
DELETE FROM dispatches;

-- Delete all needs
DELETE FROM needs;

-- Delete all volunteers
DELETE FROM volunteers;
```

---

## Useful Aliases

Add to your `.bashrc` or `.zshrc`:

```bash
alias seva-start="npm start"
alias seva-dev="npm run dev"
alias seva-test="node test-webhook.js"
alias seva-admin="node admin-cli.js"
alias seva-logs="tail -f logs/info.log"
alias seva-errors="tail -f logs/error.log"
```

Then use:
```bash
seva-start
seva-admin stats
seva-logs
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start server | `npm start` |
| Test webhook | `node test-webhook.js verify` |
| Register volunteer | `node admin-cli.js register` |
| View stats | `node admin-cli.js stats` |
| View logs | `tail -f logs/info.log` |
| Deploy | `git push origin main` |
| Check health | `curl http://localhost:3000/health` |

---

## Need Help?

- Check [README.md](./README.md) for documentation
- Check [FAQ.md](./FAQ.md) for common questions
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
- Check logs: `tail -f logs/error.log`
