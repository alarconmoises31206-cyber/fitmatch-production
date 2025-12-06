import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      return res.json({
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
        hint: 'Make sure the profiles table exists and you have run SQL migrations'
      });
    }

    res.json({
      status: 'success',
      message: 'API is working!',
      database: data ? 'Connected to profiles table' : 'No data in profiles table',
      nextSteps: 'If profiles table is missing, run SQL migrations in Supabase dashboard'
    });

  } catch (error: any) {
    res.status(500).json({ 
      status: 'error',
      message: 'Unexpected error',
      error: error.message 
    });
  }
}