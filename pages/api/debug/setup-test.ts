import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const testData = {
      id: '11111111-1111-1111-1111-111111111111',
      role: 'client',
      first_name: 'test',
      last_name: 'user'
    };

    const { error } = await supabase
      .from('profiles')
      .insert(testData);

    if (error) {
      if (error.message.includes('relation')) {
        return res.json({
          status: 'error',
          message: 'PROFILES TABLE DOES NOT EXIST',
          error: error.message,
          solution: 'Run SQL migrations in Supabase dashboard to create profiles table'
        });
      } else if (error.message.includes('role')) {
        return res.json({
          status: 'error', 
          message: 'PROFILES TABLE EXISTS BUT MISSING COLUMNS',
          error: error.message,
          solution: 'Run SQL migrations to add missing columns to profiles table'
        });
      }
    }

    await supabase.from('profiles').delete().eq('id', testData.id);

    res.json({
      status: 'success',
      message: 'Database is properly set up!'
    });

  } catch (error: any) {
    res.status(500).json({ 
      status: 'error',
      message: 'Unexpected error',
      error: error.message 
    });
  }
}
