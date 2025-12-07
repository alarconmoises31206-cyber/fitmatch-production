// pages/api/secure-chat/send.ts - Phase 18 anti-leakage system (Hybrid)
import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseClient } from '../../../lib/supabase/client';
import scanner from '../../../lib/anti-leakage/scanner';
import { logAntiLeakageEvent as logOldEvent } from '../../../lib/anti-leakage/logger';
import { detectLeakage, logAntiLeakageEvent } from '../../../lib/antiLeak';
import { supabaseAdmin } from '../../../lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, trainer_id, message } = req.body;

    // ===== NEW ANTI-LEAK DETECTION (Hybrid) =====
    let leakResult = { matched: false, rule: null, severity: 'low' as 'low' | 'medium' | 'high' };
    try {
      leakResult = await detectLeakage(message);
    } catch (le) {
      console.error('detectLeakage error', le);
    }

    // Server-side logging using service role
    try {
      if (user_id) {
        await logAntiLeakageEvent({
          user_id,
          message,
          matched_rule: leakResult.rule,
          severity: leakResult.severity,
          metadata: { source: 'secure-chat', trainer_id }
        });
      } else {
        await supabaseAdmin.from('anti_leakage_events').insert({
          user_id: null,
          message,
          matched_rule: leakResult.rule,
          severity: leakResult.severity,
          metadata: { note: 'no_user_id', source: 'secure-chat', trainer_id },
          created_at: new Date().toISOString()
        });
      }
    } catch (logErr) {
      console.error('Anti-leak logging failed', logErr);
    }

    // ===== ORIGINAL SCANNER (for backward compatibility) =====
    const scanResults = scanner.scan(message);
    const hasLeak = scanResults.length > 0 && scanResults[0].channelType !== 'other';

    if (hasLeak) {
      // Log the leakage event using old logger (optional)
      await logOldEvent({
        userId: user_id,
        trainerId: trainer_id,
        messageText: message,
        detections: scanResults
      });
    }

    // ===== TIERED BLOCKING LOGIC =====
    // High severity blocks (new system)
    if (leakResult.matched && leakResult.severity === 'high') {
      return res.status(403).json({
        success: false,
        blocked: true,
        reason: 'Message contains contact/payment info or PII which is disallowed. Please use platform payments/messaging.'
      });
    }

    // Original scanner blocks (medium/high from old system)
    if (hasLeak) {
      return res.status(403).json({
        error: 'Contact information not allowed',
        warning: 'Please keep communication within the platform',
        channelType: scanResults[0].channelType,
        detectedPattern: scanResults[0].pattern
      });
    }

    // Medium severity warning (new system)
    const warning = leakResult.matched && leakResult.severity === 'medium'
      ? { warning: 'Message contains potential off-platform contact or links; monitored by FitMatch.' }
      : null;

    // If no leaks, proceed with normal chat flow
    const supabase = createSupabaseClient();
    // ... rest of chat logic (simplified for now)

    // For now, just return success
    return res.status(200).json({
      success: true,
      message: 'Message sent (leak check passed)',
      scanResults: scanResults,
      ...warning
    });
  } catch (error) {
    console.error('Secure chat error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
