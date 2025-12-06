import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase/client';

export default function DevLogin() {
  const [status, setStatus] = useState('Setting up test environment...');
  const router = useRouter();

  useEffect(() => {
    const setupTestEnvironment = async () => {
      try {
        setStatus('Creating test user...');
        
        // Sign out any existing session
        await supabase.auth.signOut();

        // Create a new test user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: 'mltest@fitmatch.com',
          password: 'test123456',
        });

        if (authError) {
          // If user exists, try to sign in
          if (authError.message.includes('already registered')) {
            setStatus('User exists, signing in...');
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: 'mltest@fitmatch.com',
              password: 'test123456',
            });

            if (signInError) {
              throw new Error(`Sign in failed: ${signInError.message}`);
            }

            console.log('✅ Signed in with existing test user:', signInData.user?.id);
            router.push('/matches');
            return;
          }
          throw authError;
        }

        if (authData.user) {
          console.log('✅ Test user created:', authData.user.id);
          
          // Wait a moment then sign in
          setTimeout(async () => {
            setStatus('Signing in...');
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: 'mltest@fitmatch.com',
              password: 'test123456',
            });

            if (signInError) {
              throw new Error(`Auto sign-in failed: ${signInError.message}`);
            }

            console.log('✅ Auto-signed in successfully!');
            router.push('/matches');
          }, 2000);
        }

      } catch (error) {
        console.error('💥 Setup failed:', error);
        setStatus(`Error: ${error.message}`);
        
        // Fallback: try to go to matches page anyway
        setTimeout(() => {
          router.push('/matches');
        }, 3000);
      }
    };

    setupTestEnvironment();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{status}</p>
        <p className="text-sm text-gray-500 mt-2">Testing ML Matching System...</p>
      </div>
    </div>
  );
}