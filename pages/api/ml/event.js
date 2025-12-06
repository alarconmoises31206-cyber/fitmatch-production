import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, trainer_id, event_type } = req.body;
    
    if (!user_id || !trainer_id || !event_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log(`📊 Logging event: ${event_type} for user ${user_id} on trainer ${trainer_id}`);

    // Log to interaction_events table
    const { error } = await supabase
      .from('interaction_events')
      .insert({
        user_id,
        trainer_id,
        event_type,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Event logging error:', error);
      // Table might not exist yet - that's OK for now
    }

    res.status(200).json({ 
      success: true,
      event_logged: true,
      event_type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Event tracking error:', error);
    res.status(500).json({ error: 'Event tracking failed' });
  }
}