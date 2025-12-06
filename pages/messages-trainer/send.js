// /pages/api/messages/send.js - HYBRID AUTH VERSION
import { createClient } from '@supabase/supabase-js';

// Create two clients: one for server ops, one for auth
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { receiver_id, message_text, user_id } = req.body;
    const authHeader = req.headers.authorization;
    
    console.log('📩 Sending message - Auth:', authHeader ? 'Token provided' : 'No token');
    
    // Validation
    if (!receiver_id || !message_text) {
      return res.status(400).json({ 
        error: 'Missing required fields: receiver_id, message_text' 
      });
    }

    let sender_id = user_id; // Fallback to passed user_id
    
    // If auth token is provided, validate it
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      // Create auth client with token
      const supabaseAuth = createClient(
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
      
      // Get user from token
      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
      
      if (!authError && user) {
        sender_id = user.id;
        console.log('✅ Authenticated user:', user.id);
      } else {
        console.log('⚠️ Token invalid, using passed user_id:', user_id);
      }
    }
    
    if (!sender_id) {
      return res.status(401).json({ 
        error: 'Authentication required. Provide either Authorization header or user_id' 
      });
    }

    // Insert message
    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert({
        sender_id,
        receiver_id,
        message_text: message_text.trim()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Failed to send message',
        details: error.message 
      });
    }

    console.log('✅ Message sent successfully:', data.id);
    
    return res.status(200).json({ 
      success: true, 
      message: data 
    });

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}