# PHASE24_ENV_MAP
Auto-generated map of process.env references
Generated on: 2025-12-09 17:12:45

lib\middleware\withAuth.ts : Line 5 : process.env.NEXT_PUBLIC_SUPABASE_URL!,
lib\middleware\withAuth.ts : Line 6 : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
lib\stripe\index.ts : Line 4 : const secretKey = process.env.STRIPE_SECRET_KEY;
lib\supabase\client.ts : Line 5 : process.env.NEXT_PUBLIC_SUPABASE_URL!,
lib\supabase\client.ts : Line 6 : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
lib\secrets-sync.ts : Line 32 : SUPABASE_URL: process.env.SUPABASE_URL || '',
lib\secrets-sync.ts : Line 33 : SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
lib\secrets-sync.ts : Line 34 : STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
lib\secrets-sync.ts : Line 35 : STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
lib\secrets-sync.ts : Line 36 : NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
lib\secrets.ts : Line 15 : const VAULT_ADDR = process.env.VAULT_ADDR;
lib\secrets.ts : Line 16 : const VAULT_TOKEN = process.env.VAULT_TOKEN;
lib\secrets.ts : Line 17 : const VAULT_SECRET_PATH = process.env.VAULT_SECRET_PATH || 'secret/data/fitmatch';
lib\secrets.ts : Line 62 : if (process.env.NODE_ENV === 'production') {
lib\supabaseServer.ts : Line 6 : if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
lib\supabaseServer.ts : Line 9 : if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
lib\supabaseServer.ts : Line 14 : process.env.NEXT_PUBLIC_SUPABASE_URL,
lib\supabaseServer.ts : Line 15 : process.env.SUPABASE_SERVICE_ROLE_KEY,
pages\admin\payouts.tsx : Line 23 : adminToken: process.env.ADMIN_SECRET_TOKEN || '',
pages\api\admin\payout-complete.ts : Line 12 : return adminToken === process.env.ADMIN_SECRET_TOKEN;
pages\api\admin\payout-mark-failed.ts : Line 12 : return adminToken === process.env.ADMIN_SECRET_TOKEN;
pages\api\admin\payout-start.ts : Line 14 : return adminToken === process.env.ADMIN_SECRET_TOKEN;
pages\api\admin\payouts-list.ts : Line 15 : const expectedToken = process.env.ADMIN_SECRET_TOKEN;
pages\api\admin\refund.ts : Line 25 : return adminToken === process.env.ADMIN_SECRET_TOKEN;
pages\api\admin\rotate-secret.ts : Line 7 : if (!adminToken || adminToken !== process.env.ADMIN_SECRET_TOKEN) {
pages\api\admin\transactions.ts : Line 16 : return adminToken === process.env.ADMIN_SECRET_TOKEN;
pages\api\ml\match.ts : Line 6 : const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
pages\api\ml\match.ts : Line 7 : const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
pages\api\questions\unlock.ts : Line 22 : const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT || '0.20');
pages\api\stripe\webhook.ts : Line 7 : const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
pages\api\stripe\webhook.ts : Line 11 : const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
pages\api\stripe\webhook.ts : Line 48 : if (process.env.NODE_ENV === 'development') return true;
pages\api\wallet\create-checkout-session.ts : Line 9 : const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
pages\api\wallet\create-checkout-session.ts : Line 13 : const APP_URL = process.env.APP_URL || 'http://localhost:3000';
pages\api\wallet\create-checkout-session.ts : Line 14 : const DEFAULT_PRICE_ID = process.env.STRIPE_PRICE_ID_DEFAULT;
pages\api\env-check.ts : Line 7 : hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
pages\api\env-check.ts : Line 8 : hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
pages\api\env-check.ts : Line 9 : hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
pages\api\env-check.ts : Line 10 : supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
pages\api\env-check.ts : Line 11 : nodeEnv: process.env.NODE_ENV,
scripts\rotate-secret.js : Line 19 : const VAULT_ADDR = process.env.VAULT_ADDR;
scripts\rotate-secret.js : Line 20 : const VAULT_TOKEN = process.env.VAULT_TOKEN;
scripts\rotate-secret.js : Line 21 : const VAULT_SECRET_PATH = process.env.VAULT_SECRET_PATH || 'secret/data/fitmatch';
scripts\rotate-secret.js : Line 69 : const ghToken = argv.token || process.env.GH_TOKEN;
src\hooks\useConversations.ts : Line 3 : const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fitmatch.cloud:3001'
src\hooks\useLeads.ts : Line 3 : const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fitmatch.cloud:3001'
src\hooks\useMessages.ts : Line 3 : const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fitmatch.cloud:3001'
src\hooks\useProfiles.ts : Line 3 : const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fitmatch.cloud:3001'
src\lib\supabaseClient.ts : Line 3 : const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
src\lib\supabaseClient.ts : Line 4 : const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

