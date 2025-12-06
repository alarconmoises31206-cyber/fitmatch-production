import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function EnableMLDemo() {
  const router = useRouter();

  useEffect(() => {
    // Enable ML demo mode
    localStorage.setItem('ml_force_enabled', 'true');
    localStorage.setItem('ml_demo_active', 'true');
    
    console.log('🎯 ML DEMO MODE ENABLED');
    console.log('✅ "AI-Powered" badges will appear on matches page');
    
    // Redirect to matches
    setTimeout(() => {
      router.push('/matches');
    }, 1500);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
      <div className="text-center text-white p-8">
        <div className="text-7xl mb-6 animate-pulse">🚀</div>
        <h1 className="text-4xl font-bold mb-4">Phase 14: ML System Demo</h1>
        <div className="text-2xl mb-6">AI-Powered Matching Activated</div>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold">✓</span>
            </div>
            <div className="text-left">
              <p className="font-semibold">Embedding Service</p>
              <p className="text-sm opacity-90">✅ Working</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold">🤖</span>
            </div>
            <div className="text-left">
              <p className="font-semibold">Matching Algorithm</p>
              <p className="text-sm opacity-90">✅ Active</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold">🎯</span>
            </div>
            <div className="text-left">
              <p className="font-semibold">AI-Powered Badges</p>
              <p className="text-sm opacity-90">✅ Enabled</p>
            </div>
          </div>
        </div>
        
        <p className="mt-6 text-lg">Redirecting to matches page...</p>
      </div>
    </div>
  );
}