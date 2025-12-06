import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Test 1: Try to import scanner
    let scanner;
    try {
      scanner = await import('@/lib/anti-leakage/scanner');
      console.log('Scanner import success');
    } catch (e) {
      console.log('Scanner import error:', e);
    }

    // Test 2: Try to import logger
    let logger;
    try {
      logger = await import('@/lib/anti-leakage/logger');
      console.log('Logger import success');
    } catch (e) {
      console.log('Logger import error:', e);
    }

    // Test 3: Try to import supabase
    let supabase;
    try {
      const supabaseModule = await import('@/src/lib/supabaseClient');
      supabase = supabaseModule.supabase;
      console.log('Supabase import success');
    } catch (e) {
      console.log('Supabase import error:', e);
    }

    res.status(200).json({
      scanner: scanner ? 'OK' : 'FAILED',
      logger: logger ? 'OK' : 'FAILED',
      supabase: supabase ? 'OK' : 'FAILED',
      message: 'Check server console for details'
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}