import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.json({
    message: 'Manual setup required',
    instructions: [
      '1. Go to https://supabase.com/dashboard',
      '2. Select your project',
      '3. Click "SQL Editor" in the left sidebar',
      '4. Run this SQL code:',
      '',
      'CREATE TABLE IF NOT EXISTS profiles (',
      '  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,',
      '  role TEXT NOT NULL CHECK (role IN (\'client\',\'trainer\')),',
      '  first_name TEXT,',
      '  last_name TEXT,',
      '  created_at TIMESTAMPTZ DEFAULT NOW(),',
      '  updated_at TIMESTAMPTZ DEFAULT NOW()',
      ');',
      '',
      'CREATE TABLE IF NOT EXISTS trainer_onboarding (',
      '  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,',
      '  bio TEXT,',
      '  years_experience INTEGER,',
      '  specialties TEXT[],',
      '  certification TEXT,',
      '  rate_per_session INTEGER,',
      '  created_at TIMESTAMPTZ DEFAULT NOW(),',
      '  updated_at TIMESTAMPTZ DEFAULT NOW()',
      ');'
    ].join('\n')
  });
}