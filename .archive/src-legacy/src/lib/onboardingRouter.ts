// src/lib/onboardingRouter.ts
// Server-side onboarding router for Phase 33

// Note: You need to import your Supabase client correctly
// This is a placeholder - adjust based on your actual client location
// import { supabase } from './supabase/client'; // Adjust this import

import { getUserOnboardingState, getOnboardingRedirect } from './onboarding';

/**
 * Server-side function to determine where to redirect a user
 * This should be used in getServerSideProps or middleware
 */
export async function getOnboardingRedirectForUser(userId: string): Promise<string> {
  try {
    // Get user's onboarding state
    const state = await getUserOnboardingState(userId);
    
    // If no state exists, user needs to start onboarding
    if (!state) {
      return '/questionnaire';
    }
    
    // Determine redirect target
    return getOnboardingRedirect(state);
    
  } catch (error) {
    console.error('Error in getOnboardingRedirectForUser:', error);
    // Fallback to matches page
    return '/matches';
  }
}

/**
 * Middleware helper for Next.js pages
 */
export function shouldRedirectOnLogin(currentPath: string, userId: string | null): boolean {
  // Pages that don't need redirects
  const publicPages = ['/', '/login', '/signup', '/about', '/pricing'];
  
  if (!userId) return false; // No user, no redirect
  if (publicPages.includes(currentPath)) return false;
  
  // Check if current path is part of onboarding flow
  const onboardingPages = ['/questionnaire', '/matches', '/messages'];
  return !onboardingPages.includes(currentPath);
}

/**
 * Integration with existing auth flow
 * Call this after user signs up
 */
export async function handleNewUserOnboarding(userId: string, email: string): Promise<void> {
  try {
    // Determine role from email or signup context
    // This is a placeholder - you'll need to implement based on your signup flow
    const role = 'client'; // Default to client
    
    // Initialize onboarding state
    const { initializeOnboardingState } = await import('./onboarding');
    await initializeOnboardingState(userId, role);
    
    console.log(`Onboarding initialized for user: ${userId} (${role})`);
  } catch (error) {
    console.error('Error in handleNewUserOnboarding:', error);
  }
}