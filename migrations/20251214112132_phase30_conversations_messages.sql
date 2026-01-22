-- Phase 30: Conversations and Messages Tables
-- Created: 20251214112132

-- 1. Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES trainer_profiles(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one conversation per client-trainer pair
    UNIQUE(client_id, trainer_id)
);

-- 2. Create messages table  
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'trainer')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_trainer_id ON conversations(trainer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- 4. Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for conversations
-- Clients can see conversations they're part of
CREATE POLICY "Clients can view own conversations" ON conversations
    FOR SELECT USING (auth.uid() = client_id);

-- Trainers can see conversations they're part of  
CREATE POLICY "Trainers can view own conversations" ON conversations
    FOR SELECT USING (auth.uid() = trainer_id);

-- Only clients can create conversations (as per Phase 30 spec)
CREATE POLICY "Clients can create conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = client_id);

-- 6. RLS Policies for messages
-- Users can see messages in conversations they're part of
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (c.client_id = auth.uid() OR c.trainer_id = auth.uid())
        )
    );

-- Users can send messages in conversations they're part of
CREATE POLICY "Users can send messages in their conversations" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_id
            AND (
                (sender_role = 'client' AND c.client_id = auth.uid()) OR
                (sender_role = 'trainer' AND c.trainer_id = auth.uid())
            )
        )
    );

-- Users can mark their own messages as read (trainers can mark client messages as read, etc.)
CREATE POLICY "Users can update read status" ON messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (c.client_id = auth.uid() OR c.trainer_id = auth.uid())
        )
    );

-- 7. Create function to get or create conversation
CREATE OR REPLACE FUNCTION get_or_create_conversation(
    p_client_id UUID,
    p_trainer_id UUID,
    p_match_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS clear
DECLARE
    v_conversation_id UUID;
BEGIN
    -- Check if conversation already exists
    SELECT id INTO v_conversation_id
    FROM conversations
    WHERE client_id = p_client_id AND trainer_id = p_trainer_id;
    
    -- If not exists, create it (only clients can create as per Phase 30 spec)
    IF v_conversation_id IS NULL THEN
        INSERT INTO conversations (client_id, trainer_id, match_id)
        VALUES (p_client_id, p_trainer_id, p_match_id)
        RETURNING id INTO v_conversation_id;
    END IF;
    
    RETURN v_conversation_id;
END;
clear;

-- 8. Verification query
SELECT 
    'Phase 30 tables created successfully' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'conversations') as conversations_table_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'messages') as messages_table_exists;
