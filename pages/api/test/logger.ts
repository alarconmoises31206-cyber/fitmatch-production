import type { NextApiRequest, NextApiResponse } from 'next';
import scanner from '@/lib/anti-leakage/scanner';
import { logAntiLeakageEvent } from '@/lib/anti-leakage/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, userId, trainerId } = req.body;
    
    if (!text || !userId || !trainerId) {
      return res.status(400).json({ 
        error: 'text, userId, and trainerId are required'
      });
    }

    console.log('=== API Logger Test Start ===');
    
    // Scan the text
    const detections = scanner.scan(text);
    console.log('Scanner found:', detections.length, 'detections');
    
    // Log the event
    const result = await logAntiLeakageEvent({
      userId,
      trainerId,
      messageText: text,
      detections
    });
    
    console.log('=== API Logger Test End ===');

    res.status(200).json({
      success: true,
      text,
      detectionsCount: detections.length,
      logResult: result,
      message: result.warningMessage || 'No issues detected'
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
}