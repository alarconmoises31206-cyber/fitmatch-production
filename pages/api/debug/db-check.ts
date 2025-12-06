import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      return res.json({
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
        hint: error.message.includes('relation') ? 'Profiles table does not exist - run SQL migrations' : 'Check database connection'
      });
    }

    res.json({
      status: 'success', 
      message: 'Database connection successful!',
      tableExists: true,
      sampleData: data,
      nextSteps: 'If registration fails, make sure profiles table has all required columns (id, role, first_name, last_name)'
    });

  } catch (error: any) {
    res.status(500).json({ 
      status: 'error',
      message: 'Unexpected error',
      error: error.message 
    });
  }
}
