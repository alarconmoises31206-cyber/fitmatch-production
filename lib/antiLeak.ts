import { supabaseAdmin } from './supabaseServer';

export type LeakResult = {
  matched: boolean;
  rule: string | null;
  severity: 'low' | 'medium' | 'high';
  evidence?: string;
};

const patterns = [
  { name: 'email', re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, severity: 'high' },
  { name: 'phone', re: /(\+?\d{1,2}[\s-]?)?(\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}/, severity: 'high' },
  { name: 'paypal_venmo', re: /\b(paypal|venmo|cashapp|zelle|paypal.me)\b/i, severity: 'high' },
  { name: 'social_handle', re: /(?:@)[A-Za-z0-9_]{3,30}/, severity: 'medium' },
  { name: 'url', re: /(https?:\/\/[^\s]+)/i, severity: 'medium' },
  { name: 'payment_link', re: /(stripe\.com|buy\.me\/|patreon\.com|ko-fi\.com)/i, severity: 'high' },
];

export async function detectLeakage(text: string): Promise<LeakResult> {
  if (!text || !text.trim()) {
    return { matched: false, rule: null, severity: 'low' };
  }

  for (const p of patterns) {
    const m = text.match(p.re);
    if (m) {
      return {
        matched: true,
        rule: p.name,
        severity: p.severity as 'low' | 'medium' | 'high',
        evidence: m[0],
      };
    }
  }

  if (/\b(contact me|message me|dm me|email me|call me)\b/i.test(text)) {
    return { matched: true, rule: 'contact_request', severity: 'medium' };
  }

  return { matched: false, rule: null, severity: 'low' };
}

export async function logAntiLeakageEvent(opts: {
  user_id: string;
  message: string;
  matched_rule?: string | null;
  severity?: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}) {
  const payload = {
    user_id: opts.user_id,
    message: opts.message,
    matched_rule: opts.matched_rule || null,
    severity: opts.severity || 'low',
    metadata: opts.metadata || {},
    created_at: new Date().toISOString()
  };

  try {
    const { error } = await supabaseAdmin.from('anti_leakage_events').insert(payload);
    if (error) {
      console.error('logAntiLeakageEvent insert error', error);
    }
  } catch (err) {
    console.error('logAntiLeakageEvent exception', err);
  }
}
