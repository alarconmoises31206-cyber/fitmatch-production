// infra/api/withEventSystem.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { initializeEventSystem } from '../events.init';
import { log, error } from '../observability/log';

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

export function withEventSystem(handler: ApiHandler): ApiHandler {
  // Initialize the event system once
  let initialized = false;
  
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (!initialized) {
      try {
        initializeEventSystem()
        initialized = true;
      } catch (err) {
        error('[withEventSystem] Failed to initialize event system.', { error: err })
        // Don't fail the request, but log heavily
      }
    }
    
    // Proceed with the original handler
    return handler(req, res)
  }
}
