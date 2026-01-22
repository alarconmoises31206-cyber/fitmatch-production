# Phase 62 — Trainer Claim UX + Incentive Optimization
# Implementation Plan

## Overview
Optimize the external trainer claim funnel to achieve ≥25% conversion rate without adding product complexity.

## Database Schema ✓
Created: `20250103000000_phase62_claim_ux_optimization.sql`
- 8 new tables for analytics, boosts, quotas, intents, earnings, and copy testing
- Post-claim boost system (72-hour 25% score boost)
- Free tier quota tracking with weekly limits
- A/B testing framework for copy optimization

## Implementation Steps

### Step 1: Claim Entry Point Audit
**Deliverable:** `claim_sources` enum + logging

1. Extend external_claim_tokens with source tracking
2. Log all claim entry points (email, in-app, banners)
3. Add analytics for each source's conversion rate
4. Ensure single canonical claim URL with source parameter

### Step 2: Claim Page UX Redesign  
**Deliverable:** `<ClaimLanding />` component

Components needed:
1. `ClaimHero` - "You already matched with a real client"
2. `TokenEarningsPreview` - Blurred earnings teaser
3. `TierComparisonTable` - Free vs Paid clear comparison
4. `ImmediateBenefits` - What they get right now
5. `NextSteps` - Simple 3-step process

### Step 3: Immediate Post-Claim Reward
**Deliverable:** Boost logic in ranking engine

1. Add `claimed_boost_until` field to trainer_profiles
2. Modify scoring engine to apply 25% boost for 72 hours
3. Add "New on FitMatch" badge for 7 days
4. Update match ranking to prioritize boosted trainers

### Step 4: Free Tier Quota Visualization
**Deliverable:** `<QuotaMeter />` component

Features:
- Weekly match counter (10/week limit)
- Consultation response counter (3/week limit)  
- Token earnings meter (shows locked vs available)
- "X matches remaining this week" display
- Ambient pressure, no modal nags

### Step 5: Upgrade Prompt Timing Logic
**Deliverable:** Prompt rules engine

Rules to implement:
1. Show prompt when 80% of any quota is used
2. Show when attempting second paid consultation
3. Show when tokens earned > 0 but locked
4. Never show on day 0 (first 24 hours)
5. Maximum 1 prompt per day

### Step 6: Earnings Preview (Psychological)
**Deliverable:** `useEarningsPreview()` hook

Data to show:
- Tokens earned so far (locked in free tier)
- "Unlock to withdraw" CTA
- Weekly earning projection (conservative estimate)
- Comparison: "Free tier earns ~X/week, Paid earns ~Y/week"

### Step 7: Copy Optimization (Critical)
**Deliverable:** Centralized copy file

Tone guidelines:
- Professional, calm, non-salesy
- No startup hype or pressure
- Focus on facts and benefits

Key phrases to implement:
- "Clients already found you"
- "You're currently limited by the free tier"  
- "Upgrade when ready"
- "Unlock your earned tokens"

### Step 8: Analytics Instrumentation
**Deliverable:** Phase 62 analytics dashboard

Track:
- Claim page views and time on page
- Claim completion rate by source
- Time-to-upgrade distribution
- Quota exhaustion → upgrade correlation
- Copy variant performance (A/B testing)

### Step 9: Abuse & Edge Case Hardening
**Deliverable:** Edge-case tests + guards

Prevent:
- Claim link reuse (one-time use tokens)
- Duplicate claims (email verification)
- Abandoned claim flows (resume functionality)
- Partial profile submissions (graceful saves)

### Step 10: Internal Review & Lock
**Deliverable:** Director approval checklist

Review:
- Manual walkthrough of entire claim flow
- Copy audit against tone guidelines
- Upgrade flow clarity and simplicity
- Mobile responsiveness testing
- Performance under load

## Technical Components to Build

### Backend Components:
1. `ClaimAnalyticsService` - Track claim page interactions
2. `BoostCalculator` - Apply post-claim score boosts
3. `QuotaManager` - Track and enforce free tier limits
4. `UpgradeIntentEngine` - Smart prompt timing
5. `EarningsPreviewService` - Calculate and show earnings
6. `CopyOptimizer` - A/B testing and variant selection

### Frontend Components:
1. `ClaimLandingPage` - Complete claim experience
2. `QuotaMeter` - Visual quota display
3. `EarningsPreviewCard` - Earnings visualization
4. `UpgradePrompt` - Contextual upgrade suggestions
5. `TierComparison` - Free vs Paid comparison table

### API Endpoints:
1. `GET /api/claim/:token` - Get claim page data
2. `POST /api/claim/:token/analytics` - Log page interactions
3. `GET /api/trainer/quotas` - Get current quota status
4. `GET /api/trainer/earnings-preview` - Get earnings preview
5. `POST /api/trainer/upgrade-intent` - Log upgrade interest

## Success Metrics (Phase 62 Goals)

### Primary Metrics:
- Claim conversion rate: ≥25% (from contacted to claimed)
- Time-to-upgrade: <7 days for interested trainers
- Upgrade intent signals: >50% of free tier trainers

### Secondary Metrics:
- Claim page bounce rate: <40%
- Time on claim page: >60 seconds
- Quota awareness: >80% of trainers understand limits
- Support tickets: No increase from new features

## Gradual Rollout Plan

### Week 1: Internal Testing
- Deploy to staging environment
- Internal team testing of full flow
- Fix any critical issues

### Week 2: 10% Rollout
- Enable for 10% of claim tokens
- Monitor conversion rates
- A/B test copy variants

### Week 3: 50% Rollout  
- Enable for 50% of claim tokens
- Analyze quota exhaustion patterns
- Optimize upgrade prompt timing

### Week 4: 100% Rollout
- Full rollout to all claim tokens
- Monitor support tickets
- Collect qualitative feedback

## Integration with Existing System

### With Phase 61 (External Trainer Discovery):
- Claim tokens from Phase 61 flow into Phase 62
- Post-claim boosts increase match visibility
- Quota system manages free tier limits

### With Phase 60 (AI Matchmaking):
- Boosted trainers get higher scores temporarily
- Quotas affect match visibility for free tier
- Earnings based on token system from Phase 60

## Risk Mitigation

### Technical Risks:
1. **Performance impact** - Quota calculations cached
2. **Database load** - Analytics written asynchronously  
3. **Complexity creep** - Strict scope control

### Business Risks:
1. **Trainer frustration** - Clear communication of limits
2. **Support burden** - Self-service quota visibility
3. **Conversion drop** - A/B testing to optimize

## Files to Create

### Database:
- Migration file: ✓ Created

### Backend:
- `infra/phase62/` directory with services
- API endpoints in `pages/api/claim/` and `pages/api/trainer/`

### Frontend:
- `components/phase62/` with all React components
- `hooks/useEarningsPreview.ts` and other custom hooks
- `lib/copy-optimization.ts` for centralized copy

### Testing:
- Unit tests for quota calculations
- Integration tests for claim flow
- E2E tests for upgrade prompts

## Timeline Estimate

### Week 1-2: Core Infrastructure
- Database migration
- Backend services
- Basic API endpoints

### Week 3-4: Frontend Components  
- Claim landing page
- Quota visualization
- Earnings preview

### Week 5-6: Optimization & Testing
- Copy A/B testing
- Analytics dashboard
- Performance optimization

### Week 7: Rollout
- Gradual feature rollout
- Monitoring and adjustments
- Documentation

## Ready for Implementation

Phase 62 builds directly on Phases 60 & 61, optimizing the conversion funnel that was created. The database schema is ready, and the implementation plan provides clear steps.

**Next Action:** Start implementing Step 1 (Claim Entry Point Audit) or begin with the ClaimLanding component.
