-- WORKING TEST DATA CREATION
-- This should work if you have at least 2 users in auth.users

-- 1. Get two users
SELECT 'Step 1: Available users' as step;
SELECT id, email FROM auth.users LIMIT 2;

-- 2. Create profiles (if they don't exist)
SELECT 'Step 2: Creating profiles...' as step;
INSERT INTO client_profiles (user_id, full_name, created_at)
SELECT id, 'Test Client ' || row_number() OVER (), NOW()
FROM (SELECT id FROM auth.users LIMIT 1) as users
ON CONFLICT (user_id) DO NOTHING
RETURNING 'Created client profile' as result, id, user_id;

INSERT INTO trainer_profiles (user_id, full_name, created_at)
SELECT id, 'Test Trainer ' || row_number() OVER (), NOW()
FROM (SELECT id FROM auth.users LIMIT 1 OFFSET 1) as users
ON CONFLICT (user_id) DO NOTHING
RETURNING 'Created trainer profile' as result, id, user_id;

-- 3. Create conversation
SELECT 'Step 3: Creating conversation...' as step;
WITH conv AS (
    INSERT INTO conversations (client_id, trainer_id, created_at)
    SELECT 
        (SELECT id FROM client_profiles ORDER BY created_at DESC LIMIT 1),
        (SELECT id FROM trainer_profiles ORDER BY created_at DESC LIMIT 1),
        NOW() - INTERVAL '5 days'
    RETURNING id, client_id, trainer_id, created_at
)
SELECT 'Created conversation' as result, * FROM conv;

-- 4. Add message
SELECT 'Step 4: Adding message...' as step;
INSERT INTO messages (conversation_id, sender_id, sender_role, content, created_at)
SELECT 
    c.id,
    cp.user_id,
    'client',
    'Test message for nudge testing',
    NOW() - INTERVAL '4 days'
FROM conversations c
JOIN client_profiles cp ON c.client_id = cp.id
ORDER BY c.created_at DESC
LIMIT 1
RETURNING 'Added message' as result, id, conversation_id;
