-- PHASE 31 BACKFILL SCRIPT
-- Run this AFTER confirming functions exist

-- OPTION 1: Backfill ALL conversations (use for production)
DO $$
DECLARE
    conv_record RECORD;
    user_record RECORD;
    conv_count INTEGER := 0;
    user_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Starting Phase 31 backfill...';
    
    -- Backfill conversation health for ALL conversations
    FOR conv_record IN SELECT id FROM conversations
    LOOP
        BEGIN
            PERFORM compute_conversation_health(conv_record.id);
            conv_count := conv_count + 1;
            
            -- Log progress every 10 conversations
            IF conv_count % 10 = 0 THEN
                RAISE NOTICE 'Processed % conversations...', conv_count;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to process conversation %: %', conv_record.id, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Completed! Processed % conversations', conv_count;
    
    -- Backfill trust signals for ALL users
    RAISE NOTICE 'Starting trust signals backfill...';
    
    FOR user_record IN SELECT DISTINCT user_id FROM (
        SELECT client_id as user_id FROM conversations
        UNION
        SELECT trainer_id as user_id FROM conversations
        UNION
        SELECT user_id FROM client_profiles
        UNION 
        SELECT user_id FROM trainer_profiles
    ) AS all_users
    LOOP
        BEGIN
            PERFORM compute_user_trust_signals(user_record.user_id);
            user_count := user_count + 1;
            
            -- Log progress every 10 users
            IF user_count % 10 = 0 THEN
                RAISE NOTICE 'Processed % users...', user_count;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to process user %: %', user_record.user_id, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Completed! Processed trust signals for % users', user_count;
    RAISE NOTICE 'Phase 31 backfill complete!';
END $$;

-- OPTION 2: Test backfill (just 5 conversations - use for testing)
/*
DO $$
DECLARE
    conv_record RECORD;
    user_record RECORD;
BEGIN
    RAISE NOTICE 'Starting TEST backfill (5 conversations)...';
    
    -- Backfill just 5 conversations for testing
    FOR conv_record IN SELECT id FROM conversations LIMIT 5
    LOOP
        BEGIN
            PERFORM compute_conversation_health(conv_record.id);
            RAISE NOTICE 'Processed conversation: %', conv_record.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed: %', SQLERRM;
        END;
    END LOOP;
    
    -- Backfill trust signals for users in those 5 conversations
    FOR user_record IN SELECT DISTINCT user_id FROM (
        SELECT client_id as user_id FROM conversations LIMIT 5
        UNION
        SELECT trainer_id as user_id FROM conversations LIMIT 5
    ) AS test_users
    LOOP
        BEGIN
            PERFORM compute_user_trust_signals(user_record.user_id);
            RAISE NOTICE 'Processed user: %', user_record.user_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed: %', SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Test backfill complete!';
END $$;
*/

-- Check the results
SELECT 'conversation_health' as table, COUNT(*) as rows FROM conversation_health
UNION ALL
SELECT 'trust_signals' as table, COUNT(*) as rows FROM trust_signals;

-- View sample data
SELECT * FROM conversation_health LIMIT 5;
SELECT * FROM trust_signals LIMIT 5;
