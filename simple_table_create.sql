-- SUPER SIMPLE table creation
CREATE TABLE trainer_payouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trainer_id UUID,
    amount INTEGER,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verify it worked
SELECT 'Table created successfully' as result;
