import { NextApiRequest, NextApiResponse } from 'next';
import { FITNESS_SPECIALTIES } from '../../lib/constants/specialties';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.json({
    specialties: FITNESS_SPECIALTIES,
    pricing_tiers: ['budget', 'standard', 'premium'],
    days_of_week: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  });
}
