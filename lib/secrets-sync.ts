// lib/secrets-sync.ts
import { getSecrets as asyncGetSecrets } from './secrets';

let cached: Record<string,string|undefined> | null = null;
let loadingPromise: Promise<void> | null = null;

// call this at app start (optional)
export async function preloadSecrets() {
  if (cached) return;
  if (!loadingPromise) {
    loadingPromise = (async () => {
      const s = await asyncGetSecrets()
      cached = s; // Removed unnecessary cast
    })()
  }
  await loadingPromise;
}

export function getSecretSync(key: string): string | undefined {
  if (!cached) {
    // synchronous fallback: try process.env for backward compatibility
    return process.env[key];
  }
  return cached[key];
}

// convenience typed getter
export function getSecretsSync() {
  if (!cached) {
    // allow caller to handle undefineds in dev mode
    return {
      SUPABASE_URL: process.env.SUPABASE_URL || '',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || ''
    }
  }
  return cached;
}
