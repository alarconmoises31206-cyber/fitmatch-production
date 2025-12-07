// lib/anti-leakage/logger.ts - Updated for Phase 18
import { createSupabaseClient } from '../supabase/client';

export interface DetectionResult {
  channelType: 'email' | 'phone' | 'social' | 'other';
  matches: string[];
  pattern: string;
}

interface LogEventParams {
  userId: string;
  trainerId: string;
  messageText: string;
  detections: DetectionResult[];
}

export async function logAntiLeakageEvent(event: LogEventParams): Promise<boolean> {
  try {
    const supabase = createSupabaseClient();
    
    // Convert detections to a format suitable for database
    const hasLeak = event.detections.some(d => d.channelType !== 'other');
    const firstDetection = event.detections.find(d => d.channelType !== 'other');
    
    if (!hasLeak) {
      console.log('No leakage detected, skipping log');
      return true;
    }

    const { data, error } = await supabase
      .from('anti_leakage_events')
      .insert([{
        user_id: event.userId,
        trainer_id: event.trainerId,
        channel_type: firstDetection?.channelType || 'other',
        detected_text: firstDetection?.matches?.[0] || event.messageText.substring(0, 200),
        action_taken: 'warning',
        event_time: new Date().toISOString()
      }]);

    if (error) {
      console.error('Failed to log leakage event:', error);
      return false;
    }

    console.log('✅ Leakage event logged:', {
      userId: event.userId,
      trainerId: event.trainerId,
      channelType: firstDetection?.channelType
    });
    return true;
  } catch (error) {
    console.error('Error logging leakage event:', error);
    return false;
  }
}

// Alias for backward compatibility
export const logLeakageEvent = logAntiLeakageEvent;
