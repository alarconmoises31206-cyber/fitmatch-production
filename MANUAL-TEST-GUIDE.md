# PHASE 2 - MANUAL TEST GUIDE

## Prerequisites:
1. Dev server is running (check terminal)
2. Browser is open to http://localhost:3000

## TEST 1: Signup Flow
1. Navigate to http://localhost:3000/signup
2. Fill in the signup form
3. Submit the form
4. Check browser console for errors (F12 → Console)
5. Check network tab for API calls

## TEST 2: Database Connection
1. Open browser console (F12)
2. Run: await (await import('@/lib/supabase')).createSupabaseClient().from('users').select('*').limit(5)
3. Check if it returns data or a graceful error

## TEST 3: Trainer Discovery
1. Navigate to http://localhost:3000/trainer
2. Check if trainer profiles load
3. Try any search/filter functionality

## TEST 4: Messages/Matchmaking
1. Navigate to http://localhost:3000/messages
2. Check if conversations load
3. Try starting a new conversation

## QUICK DIAGNOSTICS:
- Check terminal for server errors
- Check browser console for client errors
- Test database: node test-supabase-proper.js
