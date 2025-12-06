import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export default function ResetCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function handleResetToken() {
      try {
        // Get the hash from the URL
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        const type = params.get('type');
        const error_description = params.get('error_description');

        console.log('Reset callback URL params:', { 
          access_token: access_token ? 'present' : 'missing',
          type,
          error_description 
        });

        // Check for errors first
        if (error_description) {
          throw new Error(error_description);
        }

        if (type === 'recovery' && access_token) {
          // Create a Supabase client to set the session
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );

          // Set the session using the token
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token || '',
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            throw new Error(`Token error: ${sessionError.message}`);
          }

          if (data.session) {
            // Success! Redirect to update password page
            console.log('Session set successfully, redirecting to update password...');
            router.replace('/auth/update-password');
            return;
          } else {
            throw new Error('Failed to create session');
          }
        } else {
          throw new Error('Missing or invalid reset token in URL');
        }
      } catch (err: any) {
        console.error('Reset callback error:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    // Only run if we're in the browser
    if (typeof window !== 'undefined') {
      handleResetToken();
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg">Processing reset link...</div>
          <div className="text-sm text-gray-500 mt-2">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Reset Failed</h2>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-700 text-sm">
              {error.includes('expired') ? (
                <div>
                  <p className="font-semibold">This reset link has expired.</p>
                  <p className="mt-1">Password reset links are only valid for 1 hour.</p>
                </div>
              ) : error.includes('used') ? (
                <div>
                  <p className="font-semibold">This reset link has already been used.</p>
                  <p className="mt-1">Each reset link can only be used once.</p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold">Invalid reset link</p>
                  <p className="mt-1">{error}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Link 
                href="/auth/reset-password" 
                className="inline-block bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition"
              >
                Request new reset link
              </Link>
            </div>
            <div>
              <Link 
                href="/auth/login" 
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                Back to login
              </Link>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>If you continue having issues, try:</p>
            <ul className="mt-1 space-y-1">
              <li>• Using the reset link within 1 hour</li>
              <li>• Checking your spam folder</li>
              <li>• Using the same email you registered with</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}