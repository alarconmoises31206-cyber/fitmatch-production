import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Handle GET request - return some data or empty response
    return res.json({ message: 'Questionnaire API is working' });
  }

  if (req.method === 'POST') {
    try {
      const { responses } = req.body;

      const { data, error } = await supabase
        .from('client_questionnaire_responses')
        .insert([{ responses }])
        .select();

      if (error) throw error;

      return res.json({ success: true, id: data[0].id });
    } catch (error) {
      console.error('Error saving questionnaire:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
