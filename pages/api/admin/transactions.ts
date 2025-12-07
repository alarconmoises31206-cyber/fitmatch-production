// /pages/api/admin/transactions.ts - FIXED VERSION
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseServer';

interface TransactionsResponse {
  success: boolean;
  transactions?: any[];
  total_count?: number;
  page?: number;
  page_size?: number;
  error?: string;
}

const isAdmin = (req: NextApiRequest): boolean => {
  const adminToken = req.headers['x-admin-token'];
  return adminToken === process.env.ADMIN_SECRET_TOKEN;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TransactionsResponse>
) {
  if (!isAdmin(req)) {
    return res.status(403).json({ success: false, error: 'Admin authorization required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const {
      user_id,
      trainer_id,
      type,
      start_date,
      end_date,
      page = 1,
      page_size = 50
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const pageSize = parseInt(page_size as string) || 50;
    const offset = (pageNum - 1) * pageSize;

    // Build query WITHOUT joins
    let query = supabaseAdmin
      .from('wallet_transactions')
      .select('*', { count: 'exact' });

    // Apply filters
    if (user_id) {
      query = query.eq('user_id', user_id as string);
    }

    if (trainer_id) {
      query = query.eq('trainer_id', trainer_id as string);
    }

    if (type) {
      query = query.eq('type', type as string);
    }

    if (start_date) {
      query = query.gte('created_at', start_date as string);
    }

    if (end_date) {
      query = query.lte('created_at', end_date as string);
    }

    // Add ordering and pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data: transactions, error, count } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
    }

    // If you need user/trainer names, fetch them separately
    const userIds = [...new Set(transactions?.map(tx => tx.user_id).filter(Boolean))];
    const trainerIds = [...new Set(transactions?.map(tx => tx.trainer_id).filter(Boolean))];

    let users = {};
    let trainers = {};

    if (userIds.length > 0) {
      const { data: userData } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);
      
      userData?.forEach(user => {
        users[user.id] = user;
      });
    }

    if (trainerIds.length > 0) {
      const { data: trainerData } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .in('id', trainerIds);
      
      trainerData?.forEach(trainer => {
        trainers[trainer.id] = trainer;
      });
    }

    // Format the response
    const formattedTransactions = transactions?.map(tx => ({
      id: tx.id,
      user_id: tx.user_id,
      user_name: users[tx.user_id]?.full_name || 'Unknown',
      user_email: users[tx.user_id]?.email,
      trainer_id: tx.trainer_id,
      trainer_name: trainers[tx.trainer_id]?.full_name,
      trainer_email: trainers[tx.trainer_id]?.email,
      question_id: tx.question_id,
      type: tx.type,
      amount_cents: tx.amount_cents,
      balance_after: tx.balance_after,
      metadata: tx.metadata,
      created_at: tx.created_at
    })) || [];

    return res.status(200).json({
      success: true,
      transactions: formattedTransactions,
      total_count: count || 0,
      page: pageNum,
      page_size: pageSize
    });

  } catch (error: any) {
    console.error('Error in admin transactions endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
