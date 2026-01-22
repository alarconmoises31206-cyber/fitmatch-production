-- Test 1: Create test users (you'll need to adjust with real user IDs)
-- Note: Replace with actual user IDs from your auth.users table
DO $$
DECLARE
    trainer_id UUID := ''; -- Replace with actual trainer user ID
    client_id UUID := ''; -- Replace with actual client user ID
    consultation_id UUID;
BEGIN
    -- First, let's just verify our functions exist
    RAISE NOTICE 'Test 1: Checking function existence...';
    
    -- Test 2: Create a consultation
    RAISE NOTICE 'Test 2: Creating consultation...';
    INSERT INTO consultations (trainer_id, client_id, state, rate_per_message)
    VALUES 
    (trainer_id, client_id, 'FREE', 10)
    RETURNING id INTO consultation_id;
    
    RAISE NOTICE 'Created consultation ID: %', consultation_id;
    
    -- Test 3: Set consultation rate
    RAISE NOTICE 'Test 3: Setting consultation rate...';
    PERFORM set_consultation_rate(trainer_id, consultation_id, 15);
    
    -- Test 4: Lock consultation
    RAISE NOTICE 'Test 4: Locking consultation...';
    PERFORM lock_consultation(trainer_id, consultation_id);
    
    -- Test 5: Check message permissions
    RAISE NOTICE 'Test 5: Checking message permissions...';
    
    -- Trainer should be able to send in LOCKED state
    IF assert_can_send_message(trainer_id, consultation_id) THEN
        RAISE NOTICE '✓ Trainer can send message in LOCKED state';
    ELSE
        RAISE NOTICE '✗ Trainer cannot send message in LOCKED state';
    END IF;
    
    -- Client should NOT be able to send in LOCKED state
    IF NOT assert_can_send_message(client_id, consultation_id) THEN
        RAISE NOTICE '✓ Client cannot send message in LOCKED state (correct)';
    ELSE
        RAISE NOTICE '✗ Client can send message in LOCKED state (WRONG)';
    END IF;
    
    -- Test 6: Add tokens to client
    RAISE NOTICE 'Test 6: Adding tokens to client...';
    UPDATE profiles SET token_balance = 100 WHERE id = client_id;
    
    -- Test 7: Begin paid consultation
    RAISE NOTICE 'Test 7: Beginning paid consultation...';
    PERFORM begin_paid_consultation(consultation_id, client_id);
    
    -- Test 8: Process paid message
    RAISE NOTICE 'Test 8: Processing paid message...';
    PERFORM process_paid_message(client_id, consultation_id);
    
    -- Test 9: Check balances after payment
    RAISE NOTICE 'Test 9: Checking balances...';
    
    -- Test 10: End consultation
    RAISE NOTICE 'Test 10: Ending consultation...';
    PERFORM end_consultation(trainer_id, consultation_id);
    
    RAISE NOTICE 'All tests completed!';
    
    -- Rollback for testing (remove in production)
    ROLLBACK;
    RAISE NOTICE 'TEST ROLLED BACK - No changes persisted';
END $$;
