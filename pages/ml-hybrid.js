import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase/client';

export default function MLHybrid() {
  const router = useRouter();

  useEffect(() => {
    const setupHybrid = async () => {
      console.log('🚀 Setting up hybrid ML system...');
      
      // Set a cookie or local storage flag to enable ML mode
      localStorage.setItem('ml_enabled', 'true');
      localStorage.setItem('ml_data_source', 'hybrid');
      
      // Redirect immediately to matches
      router.push('/matches');
    };

    setupHybrid();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-6xl mb-4 animate-bounce">🚀</div>
        <h1 className="text-3xl font-bold mb-2">Activating ML System</h1>
        <p className="text-xl opacity-90">Enabling AI-powered matching...</p>
      </div>
    </div>
  );
}