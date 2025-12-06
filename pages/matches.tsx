// /pages/matches.tsx - SIMPLIFIED WITH BADGES
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Verification badge component
interface VerificationBadgeProps {
  status: 'unverified' | 'verified' | 'elite';
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ status }) => {
  if (status === 'unverified') return null;
  
  const config = {
    verified: {
      text: '✓ Verified',
      className: 'bg-green-100 text-green-800 border border-green-200',
      tooltip: 'Verified and monitored on FitMatch'
    },
    elite: {
      text: '⭐ Elite',
      className: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      tooltip: 'Elite verified trainer'
    }
  }[status];

  return (
    <span 
      className={`ml-2 px-2 py-1 text-xs rounded-full ${config.className}`}
      title={config.tooltip}
    >
      {config.text}
    </span>
  );
};

interface Trainer {
  id: string;
  trainer_id: string;
  first_name: string;
  last_name: string;
  headline: string;
  bio: string;
  specialties: string[];
  experience_years: number;
  hourly_rate: number;
  avatar_url?: string;
  verified_status: 'unverified' | 'verified' | 'elite';
  subscription_status: string;
  score: number;
}

export default function MatchesPage() {
  const router = useRouter();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spins, setSpins] = useState(0);
  const [revealedTrainers, setRevealedTrainers] = useState<Set<string>>(new Set());
  const [revealing, setRevealing] = useState<string | null>(null);

  const userId = '3a5c09c2-6d11-4f24-97f0-dc0229936c28'; // Test user

  useEffect(() => {
    fetchMatches();
    fetchSpins();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ml/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });

      if (!response.ok) throw new Error('Failed to fetch matches');
      
      const data = await response.json();
      console.log('Matches data:', data);
      
      if (data.trainers) {
        setTrainers(data.trainers);
      } else if (data.results) {
        setTrainers(data.results);
      } else {
        setTrainers(data);
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to load matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpins = async () => {
    try {
      const response = await fetch('/api/credits/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSpins(data.spins_remaining || 0);
      }
    } catch (err) {
      console.error('Error fetching spins:', err);
    }
  };

  const handleReveal = async (trainerId: string) => {
    if (spins < 1) {
      alert('You need spins to reveal trainers!');
      router.push('/pricing');
      return;
    }

    try {
      setRevealing(trainerId);
      const response = await fetch('/api/credits/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          trainer_id: trainerId
        })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Reveal failed');
      
      if (data.success) {
        setRevealedTrainers(prev => new Set([...prev, trainerId]));
        setSpins(data.spins_remaining || spins - 1);
        
        // Update trainer with revealed data if provided
        if (data.trainer) {
          setTrainers(prev => prev.map(t => 
            t.id === trainerId ? { ...t, ...data.trainer } : t
          ));
        }
        
        alert(`Trainer revealed! ${data.spins_remaining} spins remaining.`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setRevealing(null);
    }
  };

  const handleMessage = (trainerId: string) => {
    if (spins < 1 && !revealedTrainers.has(trainerId)) {
      alert('You need to reveal this trainer first!');
      return;
    }
    router.push(`/messages/${trainerId}`);
  };

  const hiddenCount = trainers.length - revealedTrainers.size;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Your Trainer Matches</h1>
          <p className="text-gray-600 mt-2">
            Spend 1 spin to reveal each trainer's details
          </p>
          
          <div className="mt-6 inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="font-bold text-lg text-gray-900">
              {spins} spins available
            </span>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchMatches}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Finding your perfect trainer matches...</p>
          </div>
        )}

        {/* No Trainers */}
        {!loading && trainers.length === 0 && !error && (
          <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-xl">
            <div className="text-5xl mb-6">👨‍🏫</div>
            <h3 className="text-xl font-semibold text-gray-900">No matches found</h3>
            <p className="text-gray-600 mt-2 max-w-md mx-auto">
              {spins === 0 
                ? "You're out of spins! Purchase more spins to reveal trainers."
                : "No trainers available right now. Check back later!"
              }
            </p>
            {spins === 0 && (
              <a
                href="/pricing"
                className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Buy More Spins
              </a>
            )}
          </div>
        )}

        {/* Trainers Grid */}
        {!loading && trainers.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainers.map((trainer) => {
                const isRevealed = revealedTrainers.has(trainer.id);
                const isRevealing = revealing === trainer.id;
                const matchPercent = Math.round((trainer.score || 0) * 100);

                return (
                  <div key={trainer.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Match Score Badge */}
                    <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-500">Match Score</span>
                          <div className="text-2xl font-bold text-blue-600">
                            {matchPercent}%
                          </div>
                        </div>
                        <div className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                          {isRevealed ? 'Revealed' : 'Hidden'}
                        </div>
                      </div>
                    </div>

                    {/* Trainer Content */}
                    <div className="p-6">
                      {isRevealed ? (
                        // REVEALED VIEW
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-2xl font-bold text-blue-600">
                                {trainer.first_name?.[0]}{trainer.last_name?.[0]}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center flex-wrap">
                                <h3 className="text-xl font-bold text-gray-900">
                                  {trainer.first_name} {trainer.last_name}
                                </h3>
                                <VerificationBadge status={trainer.verified_status || 'unverified'} />
                              </div>
                              <p className="text-gray-600 text-sm mt-1">
                                {trainer.headline}
                              </p>
                            </div>
                          </div>

                          <p className="text-gray-700 line-clamp-3">
                            {trainer.bio || 'Professional fitness trainer with proven results.'}
                          </p>

                          {/* Specialties */}
                          {trainer.specialties && trainer.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {trainer.specialties.slice(0, 3).map((spec, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-100"
                                >
                                  {spec}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">
                                {trainer.experience_years || 0}
                              </div>
                              <div className="text-sm text-gray-600">Years Experience</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">
                                ${trainer.hourly_rate || 0}/hr
                              </div>
                              <div className="text-sm text-gray-600">Rate</div>
                            </div>
                          </div>

                          {/* Message Button */}
                          <button
                            onClick={() => handleMessage(trainer.id)}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity mt-4"
                          >
                            Message Trainer
                          </button>
                        </div>
                      ) : (
                        // HIDDEN VIEW
                        <div className="space-y-6 text-center">
                          <div className="space-y-3">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-3xl text-gray-400">?</span>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-gray-900">
                                Hidden Trainer
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                Reveal to see details
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleReveal(trainer.id)}
                            disabled={isRevealing || spins < 1}
                            className={`w-full py-3 rounded-lg font-semibold transition ${
                              isRevealing
                                ? 'bg-blue-100 text-blue-700 cursor-wait'
                                : spins < 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90'
                            }`}
                          >
                            {isRevealing ? (
                              <>
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Revealing...
                              </>
                            ) : (
                              `Reveal Trainer (1 Spin)`
                            )}
                          </button>

                          <div className="text-xs text-gray-500">
                            Requires 1 spin • {spins} available
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-gray-700">
                  Showing <span className="font-bold">{trainers.length}</span> trainers •{' '}
                  <span className="font-bold">{hiddenCount}</span> hidden •{' '}
                  <span className="font-bold">{revealedTrainers.size}</span> revealed
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={fetchMatches}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Refresh Matches
                  </button>
                  {spins === 0 && (
                    <a
                      href="/pricing"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Buy More Spins
                    </a>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* How It Works */}
        <div className="mt-16 p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">See Match Score</h4>
              <p className="text-gray-600">View compatibility percentage with each trainer.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Reveal with Spin</h4>
              <p className="text-gray-600">Spend 1 spin to reveal a trainer's full profile.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Start Training</h4>
              <p className="text-gray-600">Message revealed trainers to schedule sessions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}