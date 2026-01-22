# ARCHITECTURE_OPERATING_MANUAL.md
# FitMatch Phase 41 - Ship Mode Infrastructure

## Overview
This document defines the canonical architecture established in Phase 41. All future development must adhere to these patterns.

## Directory Structure
\\\
/fitmatch-production
  /app                    # Application layer
    /public_pages         # Public-facing pages (no auth required)
    /protected_pages      # Pages requiring authentication
    /api                  # API routes
  /domain                 # Business logic and entities
    /auth                 # Authentication domain
    /matching             # Matchmaking logic
    /sessions             # Training sessions
    /payments             # Payment processing
  /infra                  # Infrastructure layer
    /stripe              # Stripe integration (version-locked)
    /persistence          # Database, Prisma, Redis
    /observability        # Logging, metrics, error pipeline
\\\

## Core Rules

### 1. Stripe Stability Lock
- **DO NOT** import Stripe directly
- **USE** \infra/stripe/client.ts\ adapter only
- **API VERSION**: Locked to "2022-11-15"
- **VIOLATION**: Any direct \import Stripe from 'stripe'\ is forbidden

### 2. Domain Nouns
The 8 core entities of FitMatch:
1. User
2. Trainer  
3. Match
4. Session
5. Payment
6. Subscription
7. Profile
8. Onboarding_Attempt

**Rule**: No new nouns without architectural approval.

### 3. Observability
- **USE** \infra/observability/log.ts\ wrapper
- **REPLACE** all \console.log()\ calls
- **STRUCTURE**: All logs include JSON metadata

### 4. Dependency Management
- **SNAPSHOT**: Run dependency-cruiser before/after changes
- **GRAPH**: Check \.forensic/dep-graph-*.dot\ for changes
- **ANALYSIS**: Review dependency changes in each PR

## Migration Guide

### For Existing Code
1. Move Stripe imports to use adapter
2. Replace console.log with structured logging
3. Align types to domain nouns
4. Relocate files to canonical structure

### For New Features
1. Create feature in appropriate \/domain\ subdirectory
2. Use infrastructure adapters
3. Follow logging standards
4. Update dependency snapshot

## Quality Gates
- ✅ All Stripe usage goes through adapter
- ✅ No direct console.log statements
- ✅ Types align with domain nouns
- ✅ Dependency graph shows clean separation
- ✅ No files in root directory (except config)

## Troubleshooting

### Common Issues
1. **Stripe API version mismatch**: Check \infra/stripe/client.ts\
2. **Missing types**: Import from \domain/nouns.ts\
3. **Unstructured logs**: Use \log()\, \warn()\, \error()\ wrappers

### Verification Commands
\\\ash
# Check for direct Stripe imports
grep -r "from 'stripe'" src/ --include="*.ts" --include="*.tsx"

# Check for console.log usage  
grep -r "console\." src/ --include="*.ts" --include="*.tsx"

# Run dependency analysis
npx dependency-cruiser --config .dependency-cruiser.js src
\\\

## Phase 41 Deliverables Status
- [x] Canonical folder constitution
- [x] Stripe adapter layer
- [x] Observability wrapper  
- [x] Domain noun roster
- [x] Dependency snapshot baseline
- [x] Architecture operating manual

**Last Updated**: 2025-12-25
