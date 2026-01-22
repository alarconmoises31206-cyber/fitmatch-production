-- FIX_RLS_POLICIES.sql
-- Run this in Supabase SQL Editor to fix write permissions

-- 1. Enable RLS on tables (if not already)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- 2. Create policy for conversations table
-- Allow authenticated users to insert conversations
CREATE POLICY "Allow authenticated users to insert conversations" 
ON conversations 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow users to read their own conversations
CREATE POLICY "Users can read own conversations" 
ON conversations 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = client_id OR 
  auth.uid() = trainer_id
);

-- 3. Create policy for profiles table  
-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile" 
ON profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Allow anyone to read profiles (for trainer discovery)
CREATE POLICY "Anyone can read profiles" 
ON profiles 
FOR SELECT 
TO authenticated, anon 
USING (true);

-- 4. Create policy for matches table
-- Allow authenticated users to insert matches
CREATE POLICY "Allow authenticated users to insert matches" 
ON matches 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow users to read matches they're involved in
CREATE POLICY "Users can read own matches" 
ON matches 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = user_id OR 
  auth.uid() = trainer_id
);

-- 5. Optional: Allow public reads for some tables (for landing pages)
-- CREATE POLICY "Public can read some profiles" 
-- ON profiles 
-- FOR SELECT 
-- TO anon 
-- USING (is_public = true);

-- 6. For testing: Temporarily allow all operations (remove for production)
-- CREATE POLICY "Allow all for testing" 
-- ON conversations 
-- FOR ALL 
-- TO authenticated 
-- USING (true) 
-- WITH CHECK (true);
