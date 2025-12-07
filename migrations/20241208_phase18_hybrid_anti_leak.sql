-- Migration: Phase 18 Hybrid Anti-Leak (idempotent)
-- Creates anti_leakage_events if missing and adds index.

/* ensure uuid extension */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- create table if not exists (keeps your existing table name)
CREATE TABLE IF NOT EXISTS public.anti_leakage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NULL,
  message TEXT NOT NULL,
  matched_rule TEXT NULL,
  severity TEXT CHECK (severity IN ('low','medium','high')) DEFAULT 'low',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- index for fast lookups by user and severity
CREATE INDEX IF NOT EXISTS idx_anti_leak_user ON public.anti_leakage_events (user_id);
CREATE INDEX IF NOT EXISTS idx_anti_leak_severity ON public.anti_leakage_events (severity);
