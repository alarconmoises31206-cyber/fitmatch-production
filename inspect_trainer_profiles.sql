-- Check existing columns in trainer_profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'trainer_profiles'
ORDER BY ordinal_position;
