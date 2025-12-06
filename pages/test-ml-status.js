import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TestMLStatus() {
  const [mlStatus, setMlStatus] = useState('Checking...');

  useEffect(() => {
    const checkStatus = () => {
      const mlEnabled = localStorage.getItem('ml_force_enabled') === 'true';
      const demoActive = localStorage.getItem('ml_demo_active') === 'true';
      
      if (mlEnabled && demoActive) {
        setMlStatus('✅ ML Demo Mode ACTIVE - "AI-Powered" badges will show');
      } else if (mlEnabled) {
        setMlStatus('⚠️ ML Enabled but demo not active');
      } else {
        setMlStatus('❌ ML Demo Mode NOT active');
      }
    };

    checkStatus();
  }, []);

  const enableDemo = () => {
    localStorage.setItem('ml_force_enabled', 'true');
    localStorage.setItem('ml_demo_active', 'true');
    setMlStatus('✅ ML Demo Mode ACTIVATED!');
  };

  const disableDemo = () => {
    localStorage.removeItem('ml_force_enabled');
    localStorage.removeItem('ml_demo_active');
    setMlStatus('❌ ML Demo Mode DISABLED');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6">ML System Status Test</h1>
        
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <p className="font-mono text-sm">{mlStatus}</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={enableDemo}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:opacity-90"
          >
            Enable ML Demo Mode
          </button>
          
          <button
            onClick={disableDemo}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300"
          >
            Disable ML Demo Mode
          </button>
          
          <Link
            href="/matches"
            className="block w-full text-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
          >
            Test Matches Page
          </Link>
        </div>
        
        <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-800 mb-2">What ML Demo Mode Does:</h3>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Shows "AI-Powered" badges on matches page</li>
            <li>• Demonstrates Phase 14 ML system</li>
            <li>• Uses enhanced visual indicators</li>
            <li>• No actual database changes needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}