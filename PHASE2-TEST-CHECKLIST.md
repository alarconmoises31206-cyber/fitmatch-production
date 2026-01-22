# FitMatch Phase 2 - MVP Flow Test Checklist

## Core MVP Flows to Test:

### 1. User Signup & Database Write
- [ ] Visit /signup
- [ ] Create a new account
- [ ] Check if user data is written to database

### 2. AI Matchmaking
- [ ] Test if matchmaking returns data
- [ ] Check /messages page
- [ ] Verify conversation creation

### 3. Token Payments
- [ ] Test credit purchase flow
- [ ] Check wallet balance updates
- [ ] Verify payment processing

### 4. External Trainer Discovery
- [ ] Visit /trainer
- [ ] Check trainer profiles load
- [ ] Test trainer search/filter

## Quick Test URLs:
- http://localhost:3000/signup
- http://localhost:3000/trainer
- http://localhost:3000/messages
- http://localhost:3000/test-mvp

## Database Connection Test:
Run: node test-supabase-corrected.js
