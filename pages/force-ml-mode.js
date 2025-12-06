import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ForceMLMode() {
  const router = useRouter();

  useEffect(() => {
    // Set flag that matches.tsx can read
    localStorage.setItem('ml_force_enabled', 'true');
    localStorage.setItem('ml_demo_mode', 'true');
    
    console.log('🎯 ML DEMO MODE ACTIVATED');
    console.log('✅ AI-Powered matching will show on matches page');
    
    // Redirect to matches
    setTimeout(() => {
      router.push('/matches');
    }, 1000);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-6xl mb-4">🤖</div>
        <h1 className="text-3xl font-bold mb-2">Activating ML Demo Mode</h1>
        <p className="text-xl opacity-90">AI-Powered matching enabled</p>
      </div>
    </div>
  );
}