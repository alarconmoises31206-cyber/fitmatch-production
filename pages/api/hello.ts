import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ 
    success: true,
    message: 'Hello World! API is working!',
    timestamp: new Date().toISOString()
  });
}