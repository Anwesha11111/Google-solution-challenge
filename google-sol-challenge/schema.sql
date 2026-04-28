-- ============================================================
-- SEVA-OS Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- VOLUNTEERS
-- Stores all registered volunteers and their current state
-- ------------------------------------------------------------
CREATE TABLE volunteers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number     TEXT UNIQUE NOT NULL,          -- WhatsApp number in E.164 format e.g. 919876543210
  pincode          TEXT NOT NULL,                 -- 6-digit area pincode
  skills           TEXT[] NOT NULL DEFAULT '{}',  -- e.g. ARRAY['food','medical']
  status           TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy')),
  reliability_score INT NOT NULL DEFAULT 100,     -- starts at 100, decremented on STUCK
  total_impact     INT NOT NULL DEFAULT 0,        -- incremented on DONE
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast matching queries
CREATE INDEX idx_volunteers_pincode  ON volunteers (pincode);
CREATE INDEX idx_volunteers_status   ON volunteers (status);
CREATE INDEX idx_volunteers_skills   ON volunteers USING GIN (skills);

-- ------------------------------------------------------------
-- NEEDS
-- Each incoming coordinator message becomes a Need record
-- ------------------------------------------------------------
CREATE TYPE need_category AS ENUM ('food', 'medical', 'shelter', 'safety');
CREATE TYPE need_status   AS ENUM ('open', 'dispatched', 'resolved');

CREATE TABLE needs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_text TEXT NOT NULL,                        -- raw WhatsApp message
  category      need_category NOT NULL,
  pincode       TEXT NOT NULL,
  urgency       TEXT NOT NULL CHECK (urgency IN ('high', 'low')),
  status        need_status NOT NULL DEFAULT 'open',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_needs_status   ON needs (status);
CREATE INDEX idx_needs_pincode  ON needs (pincode);

-- ------------------------------------------------------------
-- DISPATCHES
-- Join table linking a Need to the Volunteers it was sent to
-- ------------------------------------------------------------
CREATE TYPE dispatch_status AS ENUM ('pending', 'accepted', 'done', 'stuck');

CREATE TABLE dispatches (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  need_id      UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  status       dispatch_status NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dispatches_volunteer ON dispatches (volunteer_id);
CREATE INDEX idx_dispatches_need      ON dispatches (need_id);
CREATE INDEX idx_dispatches_status    ON dispatches (status);

-- ------------------------------------------------------------
-- SEED: Add a test volunteer (replace with real data)
-- ------------------------------------------------------------
INSERT INTO volunteers (phone_number, pincode, skills)
VALUES ('919999999999', '400001', ARRAY['food', 'medical']);
