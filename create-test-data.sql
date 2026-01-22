-- ============================================
-- TEST DATA SETUP FOR NUDGE SYSTEM
-- ============================================

-- Step 1: Get or create test users
-- First, let's see what users we have
SELECT id, email, raw_user_meta_data->>'role' as role 
FROM auth.users 
LIMIT 5;

-- If no users exist, you'll need to sign up test users first
-- Or use these example UUIDs (replace with real ones):

-- Step 2: Create test conversations (run this with real user IDs)
-- REPLACE THE UUIDs BELOW WITH ACTUAL USER IDs FROM YOUR AUTH.USERS TABLE
INSERT INTO conversations (id, client_id, trainer_id, created_at) 
VALUES 
    -- Conversation 1: Recent activity (1 day ago)
    (
        '11111111-1111-1111-1111-111111111111',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- REAL CLIENT ID
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', -- REAL TRAINER ID
        NOW() - INTERVAL '1 day'
    ),
    -- Conversation 2: Stalled conversation (5 days ago)
    (
        '22222222-2222-2222-2222-222222222222',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- REAL CLIENT ID
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', -- REAL TRAINER ID
        NOW() - INTERVAL '5 days'
    ),
    -- Conversation 3: Very old conversation (10 days ago)
    (
        '33333333-3333-3333-3333-333333333333',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- REAL CLIENT ID
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', -- REAL TRAINER ID
        NOW() - INTERVAL '10 days'
    )
ON CONFLICT (id) DO NOTHING;

-- Step 3: Add messages to conversations
INSERT INTO messages (conversation_id, sender_id, sender_role, content, created_at)
VALUES
    -- Messages for conversation 1 (recent)
    (
        '11111111-1111-1111-1111-111111111111',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'client',
        'Hello, I need training!',
        NOW() - INTERVAL '1 day'
    ),
    (
        '11111111-1111-1111-1111-111111111111',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'trainer',
        'Hi! I can help with that.',
        NOW() - INTERVAL '23 hours'
    ),
    -- Messages for conversation 2 (stalled - last message 4 days ago)
    (
        '22222222-2222-2222-2222-222222222222',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'client',
        'Are you available?',
        NOW() - INTERVAL '5 days'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'trainer',
        'Yes, what do you need?',
        NOW() - INTERVAL '4 days 12 hours'
    ),
    -- Messages for conversation 3 (very stalled - last message 9 days ago)
    (
        '33333333-3333-3333-3333-333333333333',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'client',
        'Looking for a trainer',
        NOW() - INTERVAL '10 days'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'trainer',
        'I specialize in weight training',
        NOW() - INTERVAL '9 days'
    )
ON CONFLICT DO NOTHING;

-- Step 4: Create test nudges
INSERT INTO conversation_nudges (
    conversation_id, 
    user_id, 
    user_role, 
    nudge_type, 
    message,
    created_at
) VALUES
    -- Active nudge for conversation 2
    (
        '22222222-2222-2222-2222-222222222222',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'client',
        'reminder',
        'Your conversation with the trainer has been inactive for 4 days',
        NOW() - INTERVAL '1 day'
    ),
    -- Dismissed nudge for conversation 3
    (
        '33333333-3333-3333-3333-333333333333',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'client',
        'reminder',
        'Your conversation has been inactive',
        NOW() - INTERVAL '3 days'
    )
ON CONFLICT DO NOTHING;

-- Update one nudge to dismissed
UPDATE conversation_nudges 
SET dismissed = true, dismissed_at = NOW() - INTERVAL '2 days'
WHERE conversation_id = '33333333-3333-3333-3333-333333333333';

-- Step 5: Verify the data
SELECT 'conversations' as table, COUNT(*) as count FROM conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'conversation_nudges', COUNT(*) FROM conversation_nudges
UNION ALL
SELECT 'active_nudges', COUNT(*) FROM conversation_nudges WHERE dismissed = false;

-- View the test data
SELECT 'Test data ready!' as status;