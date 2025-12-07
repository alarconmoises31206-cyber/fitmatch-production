-- Create trainer_payouts table WITHOUT foreign key constraint
CREATE TABLE IF NOT EXISTS trainer_payouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trainer_id UUID NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL CHECK (status IN (''pending'', ''processing'', ''paid'', ''failed'')),
    stripe_transfer_id TEXT,
    failure_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    processed_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trainer_payouts_trainer_id ON trainer_payouts(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_payouts_status ON trainer_payouts(status);
CREATE INDEX IF NOT EXISTS idx_trainer_payouts_created_at ON trainer_payouts(created_at DESC);

-- Add locked column to trainer_earnings if table exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = ''public'' 
        AND table_name = ''trainer_earnings''
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = ''public'' 
            AND table_name = ''trainer_earnings'' 
            AND column_name = ''locked''
        ) THEN
            ALTER TABLE trainer_earnings ADD COLUMN locked BOOLEAN NOT NULL DEFAULT FALSE;
        END IF;
    END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, ''reload schema'';

-- Verify table was created
SELECT ''trainer_payouts created successfully'' as message;
