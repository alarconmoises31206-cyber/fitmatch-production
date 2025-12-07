import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseServer';

interface AdminPayoutsResponse {
  success: boolean;
  payouts?: any[];
  total_count?: number;
  page?: number;
  page_size?: number;
  error?: string;
}

const isAdmin = (req: NextApiRequest): boolean => {
  const adminToken = req.headers['x-admin-token'];
  const expectedToken = process.env.ADMIN_SECRET_TOKEN;
  
  console.log('API Debug:');
  console.log('  Received token:', adminToken ? 'Present' : 'Missing');
  console.log('  Expected token:', expectedToken ? 'Set' : 'Not set');
  console.log('  Token match:', adminToken === expectedToken);
  
  return adminToken === expectedToken;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminPayoutsResponse>
) {
  console.log('=== /api/admin/payouts-list called ===');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  if (req.method !== 'GET') {
    console.log('Error: Method not allowed');
    return res.status(405).json({ error: 'Method not allowed', success: false });
  }

  const isAdminUser = isAdmin(req);
  console.log('Is admin?', isAdminUser);
  
  if (!isAdminUser) {
    console.log('Error: Unauthorized');
    return res.status(401).json({ error: 'Unauthorized', success: false });
  }

  try {
    console.log('Querying database...');
    
    // Simple query without filters for now
    const { data: payouts, error, count } = await supabaseAdmin
      .from('trainer_payouts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(20);

    console.log('Database response - Error:', error);
    console.log('Database response - Count:', count);
    console.log('Database response - Data length:', payouts?.length || 0);

    if (error) {
      console.log('Database error:', error.message);
      return res.status(400).json({ error: error.message, success: false });
    }

    console.log('Success: Returning', payouts?.length || 0, 'payouts');
    
    return res.status(200).json({
      success: true,
      payouts: payouts || [],
      total_count: count || 0,
      page: 1,
      page_size: 20,
    });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      success: false,
    });
  }
}
