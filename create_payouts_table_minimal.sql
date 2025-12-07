-- Minimal table creation for Phase 20
CREATE TABLE IF NOT EXISTS public.trainer_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
    stripe_transfer_id TEXT,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add locked column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trainer_earnings' 
        AND column_name = 'locked'
    ) THEN
        ALTER TABLE trainer_earnings ADD COLUMN locked BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
