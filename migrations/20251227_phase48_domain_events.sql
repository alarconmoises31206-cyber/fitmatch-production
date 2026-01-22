-- Migration: Phase 48 Event Persistence
-- Creates domain_events table for durable event storage.

/* ensure uuid extension */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- create table if not exists
CREATE TABLE IF NOT EXISTS public.domain_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  emitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processed', 'failed')) DEFAULT 'pending',
  error TEXT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0
);

-- indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_domain_events_status ON public.domain_events (status);
CREATE INDEX IF NOT EXISTS idx_domain_events_emitted_at ON public.domain_events (emitted_at);
CREATE INDEX IF NOT EXISTS idx_domain_events_event_type ON public.domain_events (event_type);
CREATE INDEX IF NOT EXISTS idx_domain_events_pending_retry ON public.domain_events (emitted_at) 
  WHERE status = 'pending' AND retry_count < 5;

-- Optional: RLS (Row Level Security) if needed
-- ALTER TABLE public.domain_events ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.domain_events IS 'Stores domain events for durable, async processing.';
COMMENT ON COLUMN public.domain_events.payload IS 'Event payload as JSON.';
COMMENT ON COLUMN public.domain_events.retry_count IS 'Number of retry attempts for failed events.';
