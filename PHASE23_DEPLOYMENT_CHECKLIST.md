# PHASE 23 DEPLOYMENT CHECKLIST

## Pre-Deployment
- [ ] Apply migration: migrations/2025_phase23_secret_rotation.sql
- [ ] Verify tables created in Supabase
- [ ] Test 'npm run dev' locally
- [ ] Test rotation script with dummy values

## Deployment
- [ ] Deploy code changes to production
- [ ] Set Vault environment variables (if using Vault)
- [ ] Verify .env.example doesn't contain real secrets

## Post-Deployment
- [ ] Test admin rotation API with admin token
- [ ] Create first rotation request via API
- [ ] Document rotation procedures with team
- [ ] Schedule first secret rotation (90 days for payment keys)

## Migration Plan for Existing Code
Priority order:
1. pages/api/stripe/webhook.ts
2. pages/api/wallet/create-checkout-session.ts  
3. pages/api/env-check.ts
4. Other API endpoints using secrets

Update pattern:
- Import: import { getSecrets } from '@/lib/secrets'
- Replace: process.env.SECRET_KEY ? (await getSecrets()).SECRET_KEY
