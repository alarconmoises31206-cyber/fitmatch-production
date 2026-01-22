# Phase 61 - External Trainer Discovery - Deployment Checklist

## Database Setup
- [ ] Apply migration: `20250102000000_phase61_external_trainer_discovery.sql`
- [ ] Verify all 6 tables are created successfully
- [ ] Test RLS policies with sample users

## Backend Setup
- [ ] Install dependencies: `npm install` (if new dependencies added)
- [ ] Test TypeScript compilation: `npx tsc --noEmit`
- [ ] Run existing tests: `npm test`

## API Endpoints
- [ ] Test `/api/external/contact` with valid/invalid requests
- [ ] Test `/api/external/claim` with valid/invalid tokens
- [ ] Test `/api/admin/external-trainers` (admin only)
- [ ] Test `/api/ai/match/v2` (combined matches)

## Safety Features
- [ ] Verify safety scanning blocks off-platform attempts
- [ ] Test rate limiting (10 contacts per 24 hours)
- [ ] Verify one-message rule enforcement
- [ ] Test claim token generation and validation

## Frontend Integration
- [ ] Build and test ExternalTrainerCard component
- [ ] Build and test ExternalContactModal component
- [ ] Test useExternalTrainers hook
- [ ] Test useExternalMatchmaking hook
- [ ] Verify proper badge styling for external trainers

## Admin Interface
- [ ] Create admin page for ingesting external trainers
- [ ] Add safety flag review interface
- [ ] Add metrics dashboard for Phase 61

## Testing Scenarios

### Happy Path
1. Client sees external trainer in matches
2. Client sends introductory message (success)
3. External trainer receives email with claim link
4. Trainer claims account and becomes free tier
5. Trainer replies to client message

### Edge Cases
1. Client tries to send second message (blocked)
2. Client includes off-platform contact info (blocked)
3. Rate limit exceeded (blocked)
4. Expired claim token (rejected)
5. Safety rating too low (hidden from matches)

## Monitoring & Metrics
- [ ] Set up logging for external contact attempts
- [ ] Track conversion: external → claimed → paid
- [ ] Monitor abuse flags and safety incidents
- [ ] Track percentage of matches with externals (target: 20-30%)

## Production Deployment Steps

### Phase 1: Database Migration
1. Backup production database
2. Apply Phase 61 migration during low-traffic window
3. Verify migration success
4. Test RLS policies in production

### Phase 2: Backend Deployment
1. Deploy updated API endpoints
2. Enable feature flag for external trainers (start with 0%)
3. Monitor error rates and performance

### Phase 3: Gradual Rollout
1. Enable external trainers for 1% of users
2. Monitor metrics and safety incidents
3. Increase to 5%, 10%, 20% over 1-2 weeks
4. Full rollout if metrics are positive

### Phase 4: Post-Deployment
1. Collect user feedback on external trainers
2. Adjust score capping if needed
3. Tune ranking bias parameters
4. Optimize safety scanning rules

## Rollback Plan
1. Disable external trainers via feature flag
2. Hide external trainers from match results
3. Keep database tables (read-only)
4. Maintain claim functionality for in-progress claims

## Success Criteria
- [ ] External trainers appear in 20-30% of matches
- [ ] External → claimed conversion rate >15%
- [ ] Claimed → paid conversion rate >25%
- [ ] Abuse flags per 100 contacts <5%
- [ ] No off-platform leakage incidents
- [ ] Positive user feedback on external trainer feature

## Next Phase (Phase 62) Preparation
- [ ] Collect data on claim funnel drop-offs
- [ ] Identify UX improvements for claim flow
- [ ] Plan incentives for external trainers to upgrade
- [ ] Design free tier quota tuning system
