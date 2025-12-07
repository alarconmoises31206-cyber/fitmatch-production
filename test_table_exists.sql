-- Test if trainer_payouts table exists
SELECT 
    table_name,
    EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'trainer_payouts'
    ) as table_exists
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('trainer_payouts', 'trainer_earnings')
GROUP BY table_name;

-- Check columns if table exists
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'trainer_payouts'
ORDER BY ordinal_position;
