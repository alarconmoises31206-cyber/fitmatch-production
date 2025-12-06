import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set JSON header first
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    console.log('🔵 Admin password reset requested for:', email);

    // Find user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      return res.status(400).json({ error: `Failed to list users: ${listError.message}` });
    }

    const user = users.users.find(u => u.email === email);
    if (!user) {
      console.error('❌ User not found:', email);
      return res.status(404).json({ error: `User with email ${email} not found` });
    }

    console.log('✅ Found user:', user.id);

    // Update user password
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('❌ Error updating password:', updateError.message);
      return res.status(400).json({ error: updateError.message });
    }

    console.log('✅ Password reset successful for:', email);
    
    return res.status(200).json({ 
      success: true,
      message: 'Password updated successfully. You can now login with the new password.',
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error: any) {
    console.error('💥 Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}