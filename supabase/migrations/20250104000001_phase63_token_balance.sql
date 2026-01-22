-- supabase/migrations/20250104000001_phase63_token_balance.sql
-- Phase 63: Token economy - add token balance to user_wallets
ALTER TABLE user_wallets
ADD COLUMN IF NOT EXISTS tokens INTEGER DEFAULT 10;

-- If user_tokens table exists, copy data? Skip for now.
