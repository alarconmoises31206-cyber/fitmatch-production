-- ============================================
-- CORRECT TEST DATA SEQUENCE
-- ============================================

-- Step 1: Check what users you have
SELECT id, email, raw_user_meta_data->>'role' as role 
FROM auth.users 
LIMIT 5;

-- Step 2: If you have users but no profiles, create them
-- Example (replace with real user IDs from Step 1):
INSERT INTO client_profiles (id, user_id, full_name, created_at)
VALUES (
    gen_random_uuid(),
    'REAL_USER_ID_FROM_AUTH',  -- Get this from auth.users
    'Test Client',
    NOW()
) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO trainer_profiles (id, user_id, full_name, created_at)
VALUES (
    gen_random_uuid(),
    'ANOTHER_REAL_USER_ID_FROM_AUTH',  -- Different user
    'Test Trainer',
    NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Step 3: Now create a conversation using profile IDs
INSERT INTO conversations (client_id, trainer_id, created_at)
SELECT 
    (SELECT id FROM client_profiles LIMIT 1),
    (SELECT id FROM trainer_profiles LIMIT 1),
    NOW() - INTERVAL '5 days'
RETURNING id;

-- Step 4: Add a message
INSERT INTO messages (conversation_id, sender_id, sender_role, content, created_at)
SELECT 
    c.id,
    cp.user_id,
    'client',
    'Hello, I need training help!',
    NOW() - INTERVAL '4 days'
FROM conversations c
JOIN client_profiles cp ON c.client_id = cp.id
ORDER BY c.created_at DESC
LIMIT 1;

-- Step 5: Verify everything
SELECT 'Test data created!' as status;
