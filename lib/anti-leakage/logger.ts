// First, let's define DetectionResult locally since scanner.ts might not export it
interface DetectionResult {
  channelType: 'email' | 'phone' | 'social' | 'other';
  matches: string[];
  pattern: string;
}

// STATIC IMPORT - This should work based on your supabaseClient.ts file
import { supabase } from '@/src/lib/supabaseClient';

interface LogEventParams {
  userId: string;
  trainerId: string;
  messageText: string;
  detections: DetectionResult[];
}

interface LogEventResponse {
  success: boolean;
  actionTaken: 'warning' | 'flagged' | 'none';
  warningMessage?: string;
  isRepeatOffense: boolean;
}

/**
 * Log anti-leakage events to database and determine action
 */
export async function logAntiLeakageEvent({
  userId,
  trainerId,
  messageText,
  detections
}: LogEventParams): Promise<LogEventResponse> {
  // If no detections, nothing to log
  if (detections.length === 0) {
    return {
      success: true,
      actionTaken: 'none',
      isRepeatOffense: false
    };
  }

  try {
    console.log('=== logAntiLeakageEvent Start ===');
    console.log('Supabase client check:', supabase ? 'Exists' : 'Undefined');
    console.log('Supabase type:', typeof supabase);
    
    if (supabase) {
      console.log('Supabase has "from" method:', typeof supabase.from === 'function');
      console.log('Supabase has "select" method:', typeof supabase.from?.('test').select === 'function');
    }

    // Check if this user-trainer pair has previous events
    const { data: previousEvents, error: fetchError } = await supabase
      .from('anti_leakage_events')
      .select('id, action_taken')
      .eq('user_id', userId)
      .eq('trainer_id', trainerId)
      .order('event_time', { ascending: false })
      .limit(5);

    if (fetchError) {
      console.error('Error fetching previous events:', fetchError);
      // Continue anyway - we'll log the new event
    }

    console.log('Previous events:', previousEvents?.length || 0);

    // Determine if this is a repeat offense
    const hasPreviousWarnings = previousEvents?.some((event: any) => 
      event.action_taken === 'warning'
    ) || false;
    
    const hasPreviousFlags = previousEvents?.some((event: any) => 
      event.action_taken === 'flagged'
    ) || false;

    console.log('Has previous warnings:', hasPreviousWarnings);
    console.log('Has previous flags:', hasPreviousFlags);

    // Determine action based on history
    let actionTaken: 'warning' | 'flagged' = 'warning';
    let isRepeatOffense = hasPreviousWarnings;
    
    if (hasPreviousFlags) {
      actionTaken = 'flagged';
      isRepeatOffense = true;
    } else if (hasPreviousWarnings && previousEvents && previousEvents.length >= 2) {
      // Second warning becomes a flag
      actionTaken = 'flagged';
      isRepeatOffense = true;
    }

    console.log('Action to take:', actionTaken);

    // Log each detected channel type separately
    for (const detection of detections) {
      console.log('Logging detection:', detection.channelType);
      
      const { data, error } = await supabase
        .from('anti_leakage_events')
        .insert({
          user_id: userId,
          trainer_id: trainerId,
          channel_type: detection.channelType,
          detected_text: messageText.substring(0, 500), // Limit length
          action_taken: actionTaken
        })
        .select(); // Add .select() to get response

      if (error) {
        console.error('Error logging anti-leakage event:', error);
        console.error('Error details:', error.details, error.hint, error.code);
      } else {
        console.log('Successfully logged event:', data);
      }
    }

    // If flagged, update trainer verification status
    if (actionTaken === 'flagged') {
      await handleFlaggedTrainer(trainerId);
    }

    // Generate warning message
    let warningMessage: string | undefined;
    if (actionTaken === 'warning') {
      const channelTypes = [...new Set(detections.map(d => d.channelType))];
      if (channelTypes.includes('email') || channelTypes.includes('phone') || channelTypes.includes('social')) {
        warningMessage = "⚠️ For paid questions: Stay on FitMatch to remain protected. Off-platform payments cannot be refunded or monitored.";
      } else {
        warningMessage = "⚠️ Please keep all communication and payments for paid questions on FitMatch to ensure protection and support.";
      }
    }

    console.log('=== logAntiLeakageEvent End ===');

    return {
      success: true,
      actionTaken,
      warningMessage,
      isRepeatOffense
    };

  } catch (error) {
    console.error('Unexpected error in logAntiLeakageEvent:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return {
      success: false,
      actionTaken: 'none',
      isRepeatOffense: false
    };
  }
}

/**
 * Handle trainer flagging - downgrade verification status
 */
async function handleFlaggedTrainer(trainerId: string): Promise<void> {
  try {
    // Get current verification status
    const { data: trainer, error: fetchError } = await supabase
      .from('trainer_profiles')
      .select('verified_status')
      .eq('id', trainerId)
      .single();

    if (fetchError || !trainer) {
      console.error('Error fetching trainer:', fetchError);
      return;
    }

    // Downgrade status
    let newStatus = 'unverified';
    if (trainer.verified_status === 'elite') {
      newStatus = 'verified'; // Demote from elite to verified
    } else if (trainer.verified_status === 'verified') {
      newStatus = 'unverified'; // Demote from verified to unverified
    }
    // If already unverified, keep as unverified

    // Update trainer status
    const { error: updateError } = await supabase
      .from('trainer_profiles')
      .update({
        verified_status: newStatus,
        verification_last_checked: new Date().toISOString()
      })
      .eq('id', trainerId);

    if (updateError) {
      console.error('Error updating trainer verification status:', updateError);
    }

  } catch (error) {
    console.error('Error in handleFlaggedTrainer:', error);
  }
}