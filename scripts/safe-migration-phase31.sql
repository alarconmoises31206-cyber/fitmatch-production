-- Phase 31 Safe Migration (Only adds missing components)
-- Run this in Supabase SQL Editor

DO $$
BEGIN
    -- Check and create trust_signals table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'trust_signals') THEN
        CREATE TABLE trust_signals (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          signal_key TEXT NOT NULL,
          active BOOLEAN DEFAULT TRUE,
          earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, signal_key)
        );
        
        RAISE NOTICE 'Created trust_signals table';
    ELSE
        RAISE NOTICE 'trust_signals table already exists';
    END IF;

    -- Check and create function if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.routines WHERE routine_name = 'compute_conversation_health') THEN
        CREATE OR REPLACE FUNCTION compute_conversation_health(conversation_uuid UUID)
        RETURNS VOID AS $$
        DECLARE
          avg_client_response INTERVAL;
          avg_trainer_response INTERVAL;
          client_message_count INTEGER;
          trainer_message_count INTEGER;
          balance_ratio FLOAT;
          is_stalled BOOLEAN;
          last_message_time TIMESTAMP;
          total_messages INTEGER;
        BEGIN
          -- Calculate average response times (in minutes)
          WITH message_times AS (
            SELECT 
              sender_id,
              sent_at,
              LAG(sent_at) OVER (PARTITION BY conversation_id, sender_id ORDER BY sent_at) as prev_sent_at
            FROM messages
            WHERE conversation_id = conversation_uuid
          )
          SELECT 
            AVG(EXTRACT(EPOCH FROM (sent_at - prev_sent_at)) / 60) FILTER (WHERE sender_id = c.client_id),
            AVG(EXTRACT(EPOCH FROM (sent_at - prev_sent_at)) / 60) FILTER (WHERE sender_id = c.trainer_id)
          INTO avg_client_response, avg_trainer_response
          FROM message_times mt
          JOIN conversations c ON c.id = conversation_uuid
          WHERE prev_sent_at IS NOT NULL;

          -- Calculate message balance ratio (0-1, 0.5 = perfect balance)
          SELECT 
            COUNT(*) FILTER (WHERE sender_id = c.client_id),
            COUNT(*) FILTER (WHERE sender_id = c.trainer_id)
          INTO client_message_count, trainer_message_count
          FROM messages m
          JOIN conversations c ON c.id = conversation_uuid
          WHERE m.conversation_id = conversation_uuid;

          IF client_message_count + trainer_message_count > 0 THEN
            balance_ratio := 
              CASE 
                WHEN client_message_count = 0 THEN 0
                WHEN trainer_message_count = 0 THEN 1
                ELSE client_message_count::FLOAT / (client_message_count + trainer_message_count)::FLOAT
              END;
          ELSE
            balance_ratio := 0.5;
          END IF;

          -- Determine if conversation is stalled
          SELECT 
            COUNT(*) < 2,
            MAX(sent_at) < NOW() - INTERVAL '72 hours'
          INTO total_messages, is_stalled
          FROM messages
          WHERE conversation_id = conversation_uuid;

          IF total_messages = 1 THEN
            -- Only one message, check if it's older than 7 days
            SELECT MAX(sent_at) < NOW() - INTERVAL '7 days' 
            INTO is_stalled
            FROM messages
            WHERE conversation_id = conversation_uuid;
          END IF;

          -- Insert or update health metrics
          INSERT INTO conversation_health (
            conversation_id,
            client_response_time_avg,
            trainer_response_time_avg,
            message_balance_ratio,
            stalled,
            last_computed_at
          ) VALUES (
            conversation_uuid,
            COALESCE(avg_client_response::INTEGER, 0),
            COALESCE(avg_trainer_response::INTEGER, 0),
            balance_ratio,
            COALESCE(is_stalled, false),
            NOW()
          )
          ON CONFLICT (conversation_id) 
          DO UPDATE SET
            client_response_time_avg = EXCLUDED.client_response_time_avg,
            trainer_response_time_avg = EXCLUDED.trainer_response_time_avg,
            message_balance_ratio = EXCLUDED.message_balance_ratio,
            stalled = EXCLUDED.stalled,
            last_computed_at = EXCLUDED.last_computed_at;

        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        RAISE NOTICE 'Created compute_conversation_health function';
    ELSE
        RAISE NOTICE 'compute_conversation_health function already exists';
    END IF;

    -- Check and create second function if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.routines WHERE routine_name = 'compute_user_trust_signals') THEN
        CREATE OR REPLACE FUNCTION compute_user_trust_signals(user_uuid UUID)
        RETURNS VOID AS $$
        DECLARE
          avg_response_time INTERVAL;
          first_message_response_rate FLOAT;
          thoughtful_message_count INTEGER;
        BEGIN
          -- Check for "Responsive Communicator"
          WITH user_response_times AS (
            SELECT 
              EXTRACT(EPOCH FROM (sent_at - LAG(sent_at) OVER (
                PARTITION BY m.conversation_id, c.client_id = user_uuid OR c.trainer_id = user_uuid 
                ORDER BY sent_at
              ))) / 60 as minutes_between
            FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            WHERE m.sender_id = user_uuid
              AND LAG(sent_at) OVER (
                PARTITION BY m.conversation_id, c.client_id = user_uuid OR c.trainer_id = user_uuid 
                ORDER BY sent_at
              ) IS NOT NULL
          )
          SELECT AVG(minutes_between)
          INTO avg_response_time
          FROM user_response_times;

          -- "Responsive Communicator": Replies within 24h on average
          IF avg_response_time IS NOT NULL AND avg_response_time <= 24 * 60 THEN
            INSERT INTO trust_signals (user_id, signal_key, active, earned_at)
            VALUES (user_uuid, 'responsive_communicator', true, NOW())
            ON CONFLICT (user_id, signal_key) 
            DO UPDATE SET active = true, earned_at = NOW();
          ELSE
            UPDATE trust_signals 
            SET active = false 
            WHERE user_id = user_uuid AND signal_key = 'responsive_communicator';
          END IF;

          -- For trainers only: "Consistent Professional"
          IF EXISTS (SELECT 1 FROM trainer_profiles WHERE user_id = user_uuid) THEN
            -- Check response rate to first messages
            WITH first_messages AS (
              SELECT DISTINCT ON (conversation_id) 
                conversation_id,
                sent_at as first_message_time
              FROM messages
              WHERE conversation_id IN (
                SELECT id FROM conversations WHERE client_id = user_uuid
              )
              ORDER BY conversation_id, sent_at
            ),
            trainer_responses AS (
              SELECT COUNT(DISTINCT m.conversation_id) as responded_count
              FROM messages m
              JOIN first_messages fm ON m.conversation_id = fm.conversation_id
              WHERE m.sender_id = user_uuid
                AND m.sent_at > fm.first_message_time
                AND m.sent_at <= fm.first_message_time + INTERVAL '7 days'
            ),
            total_first_messages AS (
              SELECT COUNT(*) as total_count
              FROM first_messages
            )
            SELECT 
              COALESCE(tr.responded_count::FLOAT / NULLIF(tfm.total_count, 0), 0)
            INTO first_message_response_rate
            FROM trainer_responses tr, total_first_messages tfm;

            -- "Consistent Professional": Responds to ≥80% of first messages
            IF first_message_response_rate >= 0.8 THEN
              INSERT INTO trust_signals (user_id, signal_key, active, earned_at)
              VALUES (user_uuid, 'consistent_professional', true, NOW())
              ON CONFLICT (user_id, signal_key) 
              DO UPDATE SET active = true, earned_at = NOW();
            ELSE
              UPDATE trust_signals 
              SET active = false 
              WHERE user_id = user_uuid AND signal_key = 'consistent_professional';
            END IF;
          END IF;

          -- "Engaged Client": Sends ≥2 thoughtful messages (length > 50 chars)
          IF EXISTS (SELECT 1 FROM client_profiles WHERE user_id = user_uuid) THEN
            SELECT COUNT(*)
            INTO thoughtful_message_count
            FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            WHERE m.sender_id = user_uuid
              AND LENGTH(m.content) > 50
              AND c.client_id = user_uuid;

            IF thoughtful_message_count >= 2 THEN
              INSERT INTO trust_signals (user_id, signal_key, active, earned_at)
              VALUES (user_uuid, 'engaged_client', true, NOW())
              ON CONFLICT (user_id, signal_key) 
              DO UPDATE SET active = true, earned_at = NOW();
            ELSE
              UPDATE trust_signals 
              SET active = false 
              WHERE user_id = user_uuid AND signal_key = 'engaged_client';
            END IF;
          END IF;

        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        RAISE NOTICE 'Created compute_user_trust_signals function';
    ELSE
        RAISE NOTICE 'compute_user_trust_signals function already exists';
    END IF;

    -- Add missing indexes if they don't exist
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'conversation_health' AND indexname = 'idx_conversation_health_stalled') THEN
        CREATE INDEX idx_conversation_health_stalled ON conversation_health(stalled) WHERE stalled = true;
        RAISE NOTICE 'Created idx_conversation_health_stalled index';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'trust_signals' AND indexname = 'idx_trust_signals_user_active') THEN
        CREATE INDEX idx_trust_signals_user_active ON trust_signals(user_id, active) WHERE active = true;
        RAISE NOTICE 'Created idx_trust_signals_user_active index';
    END IF;

    -- Enable RLS if not already enabled
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'conversation_health' AND rowsecurity = true) THEN
        ALTER TABLE conversation_health ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on conversation_health';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'trust_signals' AND rowsecurity = true) THEN
        ALTER TABLE trust_signals ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on trust_signals';
    END IF;

    RAISE NOTICE 'Phase 31 migration completed successfully!';
END $$;
