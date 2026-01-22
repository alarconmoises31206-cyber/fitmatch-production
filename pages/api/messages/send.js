import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { consultation_id, message_content } = req.body;
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );

  try {
    // 1. Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 2. Check if user can send message
    const { data: canSend, error: checkError } = await supabase.rpc(
      'assert_can_send_message',
      { p_user_id: user.id, p_consultation_id: consultation_id }
    );

    if (checkError || !canSend) {
      return res.status(403).json({ error: 'Cannot send message in current consultation state' });
    }

    // 3. Get consultation details
    const { data: consultation, error: consultError } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', consultation_id)
      .single();

    if (consultError) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    // 4. If consultation is PAID and user is client, process payment
    if (consultation.state === 'PAID' && user.id === consultation.client_id) {
      const { error: paymentError } = await supabase.rpc(
        'process_paid_message',
        { p_client_id: user.id, p_consultation_id: consultation_id }
      );

      if (paymentError) {
        return res.status(402).json({ error: 'Payment required or insufficient balance' });
      }
    }

    // 5. Insert the message (you'll need to adapt this to your existing messages table)
    const { data: message, error: messageError } = await supabase
      .from('messages')  // Change to your actual messages table name
      .insert({
        consultation_id: consultation_id,
        sender_id: user.id,
        content: message_content,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (messageError) {
      return res.status(500).json({ error: 'Failed to send message' });
    }

    return res.status(200).json({ message: 'Message sent successfully', data: message });
    
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
