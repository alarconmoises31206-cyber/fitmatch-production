// pages/api/phase81/log-event.ts
// PHASE 81: Backend endpoint for user agency instrumentation
// Receives events from frontend and stores them in database

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { validateEventTypeEthics } from '../../../src/services/user-agency-instrumentation';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Phase 81: Only POST requests allowed (write-only)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Phase 81 is write-only.' });
  }

  try {
    const event = req.body;
    
    // Phase 81 Section 4: Ethics Guardrail validation
    if (!validateEventTypeEthics(event.event_type)) {
      console.warn("[Phase 81 API] Event type failed ethics guardrail");
      return res.status(400).json({ 
        error: 'Event type failed Phase 81 ethics guardrail check',
        code: 'ETHICS_VIOLATION'
      });
    }

    // Validate required fields
    if (!event.event_type || !event.user_mode || !event.context) {
      return res.status(400).json({ 
        error: 'Missing required fields: event_type, user_mode, context',
        code: 'VALIDATION_ERROR'
      });
    }

    // Sanitize metadata (remove any PII)
    const sanitizedMetadata = sanitizeEventMetadata(event.metadata || {});

    // Prepare database record
    const dbRecord = {
      event_type: event.event_type,
      user_mode: event.user_mode,
      context: event.context,
      metadata: sanitizedMetadata,
      timestamp: event.timestamp || new Date().toISOString(),
      session_id: event.session_id,
      user_id: event.user_id || null, // Optional
      page_url: event.page_url || 'unknown',
      phase_version: 'phase81-v1',
      compatibility_signal_version: event.compatibility_signal_version || null,
      created_at: new Date().toISOString()
    };

    // Insert into database
    const { data, error } = await supabase
      .from('user_agency_events')
      .insert([dbRecord]);

    if (error) {
      console.error('[Phase 81 API] Database error:', error);
      return res.status(500).json({ 
        error: 'Failed to store event',
        code: 'DATABASE_ERROR'
      });
    }

    // Phase 81: Success response (no data returned, write-only)
    return res.status(201).json({ 
      success: true,
      message: 'Event logged successfully',
      event_id: data?.[0]?.id
    });

  } catch (error) {
    console.error('[Phase 81 API] Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

// Helper function to sanitize metadata
function sanitizeEventMetadata(metadata: Record<string, any>): Record<string, any> {
  const sanitized = { ...metadata };
  
  // Remove any potential PII
  const piiFields = [
    'email', 'password', 'phone', 'address', 'name', 
    'ssn', 'credit_card', 'ip_address', 'location'
  ];
  
  piiFields.forEach(field => {
    if (sanitized[field]) {
      delete sanitized[field];
    }
  });
  
  // Ensure values are JSON serializable
  Object.keys(sanitized).forEach(key => {
    const value = sanitized[key];
    if (typeof value === 'object' && value !== null) {
      try {
        sanitized[key] = JSON.stringify(value);
      } catch {
        delete sanitized[key]; // Remove if not serializable
      }
    }
  });
  
  return sanitized;
}

// Phase 81 Section 3: Strict Instrumentation Rules
// This endpoint is write-only during Phase 81
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
