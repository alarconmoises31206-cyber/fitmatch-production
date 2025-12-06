// /components/HeaderSpinCounter.tsx
import React, { useEffect, useState } from 'react';

interface UserCredits {
  spins_remaining: number;
  last_purchased_at?: string | null;
}

export default function HeaderSpinCounter() {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = async () => {
    try {
      // TODO: Replace with actual user ID from auth
      const response = await fetch('/api/credits/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: '3a5c09c2-6d11-4f24-97f0-dc0229936c28' // Test user from Phase 16
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch credits');
      }

      const data = await response.json();
      setCredits(data);
    } catch (err) {
      console.error('Error fetching credits:', err);
      setError('Failed to load spins');
      // Fallback for demo
      setCredits({ spins_remaining: 3, last_purchased_at: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchCredits, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg animate-pulse">
        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
        <div className="w-10 h-4 bg-gray-300 rounded"></div>
      </div>
    );
  }

  const spins = credits?.spins_remaining ?? 0;
  const isLow = spins <= 2;

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={`w-5 h-5 rounded-full ${isLow ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
        {isLow && spins > 0 && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
        )}
      </div>
      
      <div className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${
        isLow 
          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
          : 'bg-blue-50 text-blue-700 border border-blue-200'
      }`}>
        {spins} {spins === 1 ? 'Spin' : 'Spins'}
      </div>

      {isLow && spins > 0 && (
        <div className="hidden md:block text-xs text-amber-600 font-medium">
          Low!
        </div>
      )}

      {spins === 0 && (
        <a 
          href="/pricing" 
          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Buy More
        </a>
      )}

      {error && (
        <div className="text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}