-- Phase 20: Trainer Payout System
-- Run this in Supabase SQL Editor

-- 1. Create trainer_payouts table
CREATE TABLE IF NOT EXISTS trainer_payouts (
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

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_trainer_payouts_trainer_id ON trainer_payouts(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_payouts_status ON trainer_payouts(status);
CREATE INDEX IF NOT EXISTS idx_trainer_payouts_created_at ON trainer_payouts(created_at DESC);

-- 2. Add locked column to trainer_earnings (if not exists)
DO \$\$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trainer_earnings' AND column_name = 'locked'
    ) THEN
        ALTER TABLE trainer_earnings ADD COLUMN locked BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
END \$\$;

-- 3. RPC: Check and lock trainer earnings (atomic operation)
CREATE OR REPLACE FUNCTION lock_trainer_earnings_if_unlocked(
    trainer_uuid UUID,
    payout_amount INTEGER
)
RETURNS BOOLEAN AS \$\$
DECLARE
    current_earnings INTEGER;
    is_locked BOOLEAN;
BEGIN
    -- Get current earnings and lock status
    SELECT total_earned, locked INTO current_earnings, is_locked
    FROM trainer_earnings 
    WHERE trainer_id = trainer_uuid
    FOR UPDATE; -- Row-level lock
    
    IF NOT FOUND THEN
        RETURN FALSE; -- No earnings record
    END IF;
    
    IF is_locked THEN
        RETURN FALSE; -- Already locked
    END IF;
    
    IF current_earnings < payout_amount THEN
        RETURN FALSE; -- Insufficient funds
    END IF;
    
    -- Lock and proceed
    UPDATE trainer_earnings 
    SET locked = TRUE 
    WHERE trainer_id = trainer_uuid;
    
    RETURN TRUE;
END;
\$\$ LANGUAGE plpgsql;

-- 4. RPC: Unlock trainer earnings
CREATE OR REPLACE FUNCTION unlock_trainer_earnings(trainer_uuid UUID)
RETURNS VOID AS \$\$
BEGIN
    UPDATE trainer_earnings 
    SET locked = FALSE 
    WHERE trainer_id = trainer_uuid;
END;
\$\$ LANGUAGE plpgsql;

-- 5. RPC: Complete payout (deduct earnings and unlock)
CREATE OR REPLACE FUNCTION complete_trainer_payout(
    trainer_uuid UUID,
    payout_amount INTEGER
)
RETURNS VOID AS \$\$
BEGIN
    UPDATE trainer_earnings 
    SET 
        total_earned = total_earned - payout_amount,
        locked = FALSE
    WHERE trainer_id = trainer_uuid;
END;
\$\$ LANGUAGE plpgsql;

-- 6. Add comment for documentation
COMMENT ON TABLE trainer_payouts IS 'Tracks all trainer payout transactions';
COMMENT ON COLUMN trainer_payouts.status IS 'pending=created, processing=locked/funds reserved, paid=completed, failed=rejected';
COMMENT ON COLUMN trainer_earnings.locked IS 'Prevents double-spending during payout processing';
