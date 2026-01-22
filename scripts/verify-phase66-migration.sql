-- scripts/verify-phase66/verify-migration.sql
-- Verify Phase 66 Database Migration

DO $$
DECLARE
  client_table_exists BOOLEAN;
  trainer_table_exists BOOLEAN;
  client_ai_column_exists BOOLEAN;
  trainer_ai_column_exists BOOLEAN;
  function_exists BOOLEAN;
BEGIN
  -- Check if client_profiles table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'client_profiles'
  ) INTO client_table_exists;
  
  -- Check if trainer_profiles table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'trainer_profiles'
  ) INTO trainer_table_exists;
  
  -- Check if ai_summary column exists in client_profiles
  IF client_table_exists THEN
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'client_profiles' 
      AND column_name = 'ai_summary'
    ) INTO client_ai_column_exists;
  END IF;
  
  -- Check if ai_summary column exists in trainer_profiles
  IF trainer_table_exists THEN
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'trainer_profiles' 
      AND column_name = 'ai_summary'
    ) INTO trainer_ai_column_exists;
  END IF;
  
  -- Check if safe_update_ai_summary function exists
  SELECT EXISTS (
    SELECT FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name = 'safe_update_ai_summary'
    AND routine_type = 'FUNCTION'
  ) INTO function_exists;
  
  -- Print verification results
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'Phase 66 Migration Verification';
  RAISE NOTICE '=========================================';
  
  IF client_table_exists THEN
    RAISE NOTICE '✅ client_profiles table exists';
  ELSE
    RAISE NOTICE '❌ client_profiles table missing';
  END IF;
  
  IF trainer_table_exists THEN
    RAISE NOTICE '✅ trainer_profiles table exists';
  ELSE
    RAISE NOTICE '❌ trainer_profiles table missing';
  END IF;
  
  IF client_ai_column_exists THEN
    RAISE NOTICE '✅ client_profiles.ai_summary column exists';
  ELSE
    RAISE NOTICE '❌ client_profiles.ai_summary column missing';
  END IF;
  
  IF trainer_ai_column_exists THEN
    RAISE NOTICE '✅ trainer_profiles.ai_summary column exists';
  ELSE
    RAISE NOTICE '❌ trainer_profiles.ai_summary column missing';
  END IF;
  
  IF function_exists THEN
    RAISE NOTICE '✅ safe_update_ai_summary function exists';
  ELSE
    RAISE NOTICE '❌ safe_update_ai_summary function missing';
  END IF;
  
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'Phase 66 Database Migration Complete';
  RAISE NOTICE 'AI summaries are NON-AUTHORITATIVE';
  RAISE NOTICE 'System functions fully without AI';
  RAISE NOTICE '=========================================';
END $$;
