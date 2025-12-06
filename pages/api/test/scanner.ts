import type { NextApiRequest, NextApiResponse } from 'next';
import scanner from '@/lib/anti-leakage/scanner';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const detections = scanner.scan(text);
  const hasIssues = scanner.hasIssues(text);
  const warning = scanner.getWarningMessage(detections);

  res.status(200).json({
    text,
    detections,
    hasIssues,
    warning,
    patterns: Object.keys(scanner['patterns']) // Access private property for info
  });
}