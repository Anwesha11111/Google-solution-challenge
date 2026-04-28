# SEVA-OS Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        WhatsApp Users                            │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │  Coordinator     │              │   Volunteers     │         │
│  │  (Sends needs)   │              │  (Accept tasks)  │         │
│  └────────┬─────────┘              └────────┬─────────┘         │
└───────────┼──────────────────────────────────┼──────────────────┘
            │                                  │
            │ WhatsApp Message                 │ WhatsApp Message
            │ (Raw text)                       │ (YES/NO/DONE/STUCK)
            │                                  │
            ▼                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SEVA-OS Server (Node.js)                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  POST /webhook/whatsapp                                  │   │
│  │  ├─ Verify Meta signature                                │   │
│  │  ├─ Route: Coordinator vs Volunteer                      │   │
│  │  └─ Dispatch to handlers                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Coordinator Handler                                     │   │
│  │  ├─ extractNeedSignal() → LLM (Gemini/Groq)             │   │
│  │  ├─ Store in needs table                                 │   │
│  │  ├─ matchAndDispatch()                                   │   │
│  │  │  ├─ Query volunteers (same pincode first)             │   │
│  │  │  ├─ Send WhatsApp alerts                              │   │
│  │  │  └─ Create dispatch records                           │   │
│  │  └─ Log to logger                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Volunteer Handler (State Machine)                       │   │
│  │  ├─ YES  → Accept dispatch, mark busy                    │   │
│  │  ├─ NO   → Decline, stay available                       │   │
│  │  ├─ DONE → Complete, increment impact                    │   │
│  │  └─ STUCK → Alert admin, ding reliability                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Admin CLI (admin-cli.js)                                │   │
│  │  ├─ register: Add new volunteer                          │   │
│  │  ├─ list: View all volunteers                            │   │
│  │  ├─ stats: System statistics                             │   │
│  │  ├─ top: Top volunteers by impact                        │   │
│  │  └─ reset: Reset volunteer status                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Logging (logger.js)                                     │   │
│  │  ├─ Console output (colored)                             │   │
│  │  └─ File output (JSON lines)                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
            │                                  │
            │ HTTP POST                        │ HTTP POST
            │ (sendWhatsAppMessage)            │ (sendWhatsAppMessage)
            │                                  │
            ▼                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              Meta WhatsApp Cloud API                             │
│  https://graph.facebook.com/v19.0/{phone_id}/messages           │
└─────────────────────────────────────────────────────────────────┘
            │
            │ HTTP POST
            │ (extractNeedSignal)
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│              LLM API (Gemini or Groq)                            │
│  ├─ Gemini: https://generativelanguage.googleapis.com/v1beta/   │
│  └─ Groq: https://api.groq.com/openai/v1/chat/completions      │
└─────────────────────────────────────────────────────────────────┘
            │
            │ HTTP POST
            │ (Supabase client)
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│              Supabase (PostgreSQL)                               │
│  ├─ volunteers (id, phone, pincode, skills, status, etc.)       │
│  ├─ needs (id, text, category, pincode, urgency, status)        │
│  └─ dispatches (id, need_id, volunteer_id, status)              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Coordinator Message

```
1. Coordinator sends WhatsApp message
   "Food needed at 400001"
   │
   ▼
2. Meta sends webhook POST to /webhook/whatsapp
   │
   ▼
3. Server extracts message text
   │
   ▼
4. Check if sender is volunteer (no)
   │
   ▼
5. Call extractNeedSignal(text)
   │
   ├─ Send to Gemini API
   ├─ Parse JSON response
   └─ Return { category: "food", pincode: "400001", urgency: "high" }
   │
   ▼
6. Insert into needs table
   │
   ├─ original_text: "Food needed at 400001"
   ├─ category: "food"
   ├─ pincode: "400001"
   ├─ urgency: "high"
   └─ status: "open"
   │
   ▼
7. Query volunteers table
   │
   ├─ WHERE status = 'available'
   ├─ AND skills contains 'food'
   ├─ AND pincode = '400001'
   └─ ORDER BY reliability_score DESC
   └─ LIMIT 3
   │
   ▼
8. For each volunteer:
   │
   ├─ Send WhatsApp alert
   ├─ Create dispatch record (status: pending)
   └─ Log to logger
   │
   ▼
9. Volunteer receives alert on WhatsApp
   "🚨 SEVA-OS ALERT
    Need: FOOD at pincode 400001
    Reply YES to accept"
```

---

## Data Flow: Volunteer Reply (YES)

```
1. Volunteer sends WhatsApp message "YES"
   │
   ▼
2. Meta sends webhook POST to /webhook/whatsapp
   │
   ▼
3. Server extracts message text
   │
   ▼
4. Check if sender is volunteer (yes)
   │
   ▼
5. Fetch volunteer record from DB
   │
   ▼
6. Find their pending dispatch
   │
   ├─ WHERE volunteer_id = {id}
   ├─ AND status IN ('pending', 'accepted')
   └─ ORDER BY created_at DESC
   └─ LIMIT 1
   │
   ▼
7. Update dispatch status: pending → accepted
   │
   ▼
8. Update need status: open → dispatched
   │
   ▼
9. Update volunteer status: available → busy
   │
   ▼
10. Send WhatsApp confirmation
    "✅ Assignment accepted!
     Task: FOOD at 400001
     Coordinator: +91-XXXXX-XXXXX
     Reply DONE when complete, or STUCK if you need help"
    │
    ▼
11. Volunteer is now busy and waiting for task completion
```

---

## Data Flow: Volunteer Reply (DONE)

```
1. Volunteer sends WhatsApp message "DONE"
   │
   ▼
2. Server finds their accepted dispatch
   │
   ▼
3. Update dispatch status: accepted → done
   │
   ▼
4. Update need status: dispatched → resolved
   │
   ▼
5. Update volunteer:
   │
   ├─ status: busy → available
   └─ total_impact: +1
   │
   ▼
6. Send WhatsApp thank-you
   "🙏 Thank you! Your impact has been logged.
    You're making a difference."
   │
   ▼
7. Volunteer is back available for next task
```

---

## Data Flow: Volunteer Reply (STUCK)

```
1. Volunteer sends WhatsApp message "STUCK"
   │
   ▼
2. Server finds their accepted dispatch
   │
   ▼
3. Update dispatch status: accepted → stuck
   │
   ▼
4. Update volunteer:
   │
   ├─ status: busy → available
   └─ reliability_score: -10 (max 0)
   │
   ▼
5. Send WhatsApp to admin
   "⚠️ SEVA-OS: Volunteer {phone} is STUCK on need {id}.
    Manual intervention required."
   │
   ▼
6. Send WhatsApp to volunteer
   "⚠️ Got it. We've alerted the coordinator.
    Hang tight — help is on the way."
   │
   ▼
7. Admin manually intervenes (calls volunteer, sends help, etc.)
```

---

## Database Schema

### volunteers
```sql
id              UUID PRIMARY KEY
phone_number    TEXT UNIQUE NOT NULL        -- E.164 format
pincode         TEXT NOT NULL               -- 6-digit area code
skills          TEXT[] NOT NULL             -- ['food', 'medical', ...]
status          TEXT NOT NULL               -- 'available' | 'busy'
reliability_score INT NOT NULL DEFAULT 100  -- 0-100, decremented on STUCK
total_impact    INT NOT NULL DEFAULT 0      -- incremented on DONE
created_at      TIMESTAMPTZ NOT NULL
```

### needs
```sql
id              UUID PRIMARY KEY
original_text   TEXT NOT NULL               -- raw coordinator message
category        ENUM NOT NULL               -- 'food' | 'medical' | 'shelter' | 'safety'
pincode         TEXT NOT NULL               -- extracted or defaulted
urgency         TEXT NOT NULL               -- 'high' | 'low'
status          ENUM NOT NULL               -- 'open' | 'dispatched' | 'resolved'
created_at      TIMESTAMPTZ NOT NULL
```

### dispatches
```sql
id              UUID PRIMARY KEY
need_id         UUID NOT NULL (FK)          -- references needs(id)
volunteer_id    UUID NOT NULL (FK)          -- references volunteers(id)
status          ENUM NOT NULL               -- 'pending' | 'accepted' | 'done' | 'stuck'
created_at      TIMESTAMPTZ NOT NULL
```

---

## API Endpoints

### POST /webhook/whatsapp
Receives all incoming WhatsApp messages from Meta.

**Request:**
```json
{
  "entry": [
    {
      "changes": [
        {
          "value": {
            "messages": [
              {
                "from": "919876543210",
                "text": { "body": "Food needed at 400001" }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

**Response:** `200 OK` (immediately)

---

### GET /webhook/whatsapp
Webhook verification (called by Meta during setup).

**Query Parameters:**
- `hub.mode`: "subscribe"
- `hub.verify_token`: Your verify token
- `hub.challenge`: Random challenge string

**Response:** `200 OK` with challenge string

---

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "SEVA-OS",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

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
LOG_LEVEL=INFO  # ERROR, WARN, INFO, DEBUG
LOG_DIR=./logs
NODE_ENV=production
```

---

## Error Handling

### LLM Extraction Fails
- Log error
- Silently fail (don't crash server)
- Coordinator doesn't get feedback (can retry)

### Volunteer Not Found
- Log warning
- Ignore message

### Dispatch Creation Fails
- Log error
- Continue with next volunteer

### WhatsApp Send Fails
- Log error
- Retry on next webhook (Meta will retry)

### Database Connection Fails
- Log error
- Server crashes (Render will restart)

---

## Scaling Considerations

### Current Limits
- Gemini: 60 req/min (free tier)
- Groq: 30 req/min (free tier)
- WhatsApp: 1,000 service conversations/month
- Supabase: 500MB storage, unlimited API calls

### Bottlenecks
1. **LLM Rate Limiting**: Add queue if >60 needs/min
2. **WhatsApp Rate Limiting**: Add queue if >1,000 msgs/month
3. **Database**: Supabase free tier handles 1,000+ volunteers easily
4. **Server**: Render free tier handles 10+ concurrent requests

### Upgrade Path
1. Increase LLM rate limits (paid tier)
2. Increase WhatsApp message quota (pay-per-message)
3. Upgrade Supabase (Pro tier: $25/mo)
4. Upgrade Render (Standard: $7/mo)

---

## Security Considerations

### Current Implementation
- ✅ Webhook verification (Meta signature)
- ✅ Service role key (not exposed to client)
- ✅ Environment variables (not in code)
- ⚠️ No rate limiting (add if needed)
- ⚠️ No authentication (WhatsApp phone is auth)

### Recommendations
1. Add rate limiting per phone number
2. Add request signing (HMAC)
3. Add IP whitelisting (Meta IPs only)
4. Add audit logging (who did what)
5. Add encryption for sensitive data

---

## Monitoring & Observability

### Logs
- `logs/error.log`: Errors only
- `logs/warn.log`: Warnings + errors
- `logs/info.log`: Info + warnings + errors
- `logs/debug.log`: Everything

### Metrics to Track
- Needs created per hour
- Dispatch success rate
- Volunteer response time
- Volunteer completion rate
- LLM extraction accuracy
- WhatsApp message delivery rate

### Alerts
- LLM API down
- WhatsApp API down
- Database connection lost
- High error rate (>5% of requests)
- Volunteer stuck (manual intervention needed)
