-- Verify failed payout details
SELECT 
    id,
    trainer_id,
    amount,
    status,
    failure_reason,
    stripe_transfer_id,
    created_at,
    processed_at
FROM trainer_payouts 
WHERE status = 'failed'
ORDER BY created_at DESC;
