# SEVA-OS Deployment Guide

## Option 1: Render (Recommended for Free Tier)

### Prerequisites
- GitHub account with repo pushed
- Render account (free tier)

### Steps

1. **Create Render Web Service**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Select the branch (main)

2. **Configure Build & Start**
   - Build Command: `npm install`
   - Start Command: `node index.js`
   - Instance Type: Free

3. **Add Environment Variables**
   - In Render dashboard, go to Environment
   - Add all variables from `.env.example`:
     ```
     SUPABASE_URL=...
     SUPABASE_SERVICE_ROLE_KEY=...
     WA_PHONE_NUMBER_ID=...
     WA_ACCESS_TOKEN=...
     WA_VERIFY_TOKEN=...
     GEMINI_API_KEY=...
     ADMIN_PHONE=...
     LOG_LEVEL=INFO
     ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete
   - Copy your URL: `https://your-app-name.onrender.com`

5. **Set WhatsApp Webhook**
   - Go to Meta Developers → Your App → WhatsApp → Configuration
   - Webhook URL: `https://your-app-name.onrender.com/webhook/whatsapp`
   - Verify Token: (use the value from `WA_VERIFY_TOKEN`)
   - Click "Verify and Save"

### Render Free Tier Limits
- 750 compute hours/month (enough for ~1 app running 24/7)
- Auto-spins down after 15 min inactivity (causes ~30s cold start)
- Upgrade to $7/mo to prevent spin-down

---

## Option 2: Vercel (Serverless)

### Prerequisites
- GitHub account
- Vercel account (free tier)

### Steps

1. **Convert to Vercel Serverless**
   - Create `vercel.json`:
     ```json
     {
       "buildCommand": "npm install",
       "functions": {
         "index.js": {
           "memory": 1024,
           "maxDuration": 60
         }
       }
     }
     ```

2. **Deploy**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repo
   - Add environment variables
   - Deploy

3. **Set WhatsApp Webhook**
   - Webhook URL: `https://your-app.vercel.app/api/webhook/whatsapp`

### Vercel Free Tier Limits
- 100 GB bandwidth/month
- No cold start penalty (always warm)
- Better for high-traffic scenarios

---

## Option 3: Railway (Alternative)

### Steps

1. Go to [railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Add environment variables
4. Railway auto-detects Node.js and deploys

### Railway Free Tier
- $5 credit/month (usually enough for MVP)
- No cold starts

---

## Option 4: Self-Hosted (DigitalOcean, AWS EC2, etc.)

### Prerequisites
- Server with Node.js 18+
- SSH access

### Steps

1. **SSH into server**
   ```bash
   ssh root@your-server-ip
   ```

2. **Install dependencies**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs git
   ```

3. **Clone repo**
   ```bash
   git clone https://github.com/your-username/seva-os.git
   cd seva-os
   npm install
   ```

4. **Create `.env` file**
   ```bash
   nano .env
   # Paste your environment variables
   ```

5. **Run with PM2 (process manager)**
   ```bash
   npm install -g pm2
   pm2 start index.js --name "seva-os"
   pm2 startup
   pm2 save
   ```

6. **Set up reverse proxy (Nginx)**
   ```bash
   sudo apt-get install -y nginx
   sudo nano /etc/nginx/sites-available/default
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo systemctl restart nginx
   ```

7. **Enable HTTPS (Let's Encrypt)**
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Monitoring & Logs

### Render
- Dashboard → Logs tab
- Real-time streaming of stdout/stderr

### Vercel
- Dashboard → Deployments → Logs
- Function logs available

### Self-Hosted
```bash
# View logs
pm2 logs seva-os

# Monitor CPU/memory
pm2 monit
```

### Local Logs
- Logs written to `./logs/` directory
- `error.log`, `warn.log`, `info.log`, `debug.log`
- JSON lines format for easy parsing

---

## Scaling Beyond Free Tier

### When to Upgrade

| Metric | Free Tier | Action |
|--------|-----------|--------|
| Volunteers | <100 | Stay free |
| Volunteers | 100–1000 | Upgrade to $7/mo (Render) |
| Volunteers | >1000 | Consider dedicated database + CDN |
| Requests/sec | <10 | Stay free |
| Requests/sec | 10–100 | Upgrade to paid tier |
| Requests/sec | >100 | Horizontal scaling needed |

### Upgrade Path

1. **Database**: Supabase free → Pro ($25/mo)
   - 8GB storage, 50GB bandwidth
   - Better performance

2. **Hosting**: Render free → Standard ($7/mo)
   - No cold starts
   - 750 compute hours/month

3. **LLM**: Gemini free → Paid
   - Higher rate limits
   - Better latency

4. **WhatsApp**: 1,000 conversations → Pay per message
   - ~$0.0025 per message

---

## Troubleshooting Deployment

### Webhook not receiving messages
```bash
# Check logs
curl https://your-app.onrender.com/health

# Verify webhook URL in Meta dashboard
# Verify token matches WA_VERIFY_TOKEN
```

### Cold start delays
- Render free tier: Expected 30s on first request after inactivity
- Solution: Upgrade to paid tier or use Vercel

### Database connection errors
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Verify Supabase project is active
- Check network policies in Supabase dashboard

### LLM API errors
- Check API key validity
- Check rate limits (Gemini: 60 req/min, Groq: 30 req/min)
- Add retry logic in `services.js`

### WhatsApp messages not sending
- Verify `WA_ACCESS_TOKEN` (tokens expire after 60 days)
- Check phone number format (E.164 without `+`)
- Verify app is in production mode (not development)

---

## Backup & Recovery

### Database Backups
Supabase auto-backs up daily. To restore:
1. Go to Supabase dashboard → Backups
2. Click "Restore" on desired backup
3. Confirm

### Code Backups
- GitHub is your backup
- All code is version-controlled
- Rollback: `git revert <commit-hash>`

---

## Cost Estimate (Monthly)

| Service | Free Tier | Paid Tier | Cost |
|---------|-----------|-----------|------|
| Supabase | 500MB | 8GB | $0–$25 |
| Render | 750 hrs | Unlimited | $0–$7 |
| Gemini API | 60 req/min | Unlimited | $0–$5 |
| WhatsApp | 1,000 msgs | Pay-per-msg | $0–$50 |
| **Total** | | | **$0–$87** |

For an MVP with <100 volunteers, stay on free tier.
