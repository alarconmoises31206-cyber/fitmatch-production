-- Phase 31 Database Diagnostic Script
-- Run this in Supabase SQL Editor to see what's already implemented

-- 1. Check if tables exist
SELECT 
    table_name,
    CASE WHEN table_name IN ('conversation_health', 'trust_signals') THEN '✅' ELSE '❌' END as exists
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversation_health', 'trust_signals');

-- 2. Check if functions exist
SELECT 
    routine_name,
    CASE WHEN routine_name IN ('compute_conversation_health', 'compute_user_trust_signals', 'update_updated_at_column') THEN '✅' ELSE '❌' END as exists
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('compute_conversation_health', 'compute_user_trust_signals', 'update_updated_at_column');

-- 3. Check table structures
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'conversation_health'
ORDER BY ordinal_position;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'trust_signals'
ORDER BY ordinal_position;

-- 4. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('conversation_health', 'trust_signals')
ORDER BY tablename, policyname;

-- 5. Check indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('conversation_health', 'trust_signals')
ORDER BY tablename, indexname;
