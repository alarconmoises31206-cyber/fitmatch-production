'use client';
import { useState, useEffect } from 'react';

export default function MatchResults() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple mock data - no complex calculations
    const mockMatches = [
      {
        id: '1',
        name: 'Alex Johnson',
        specialty: 'Strength Training', 
        matchScore: 92,
        goalsScore: 95,
        styleScore: 88,
        motivationScore: 90
      },
      {
        id: '2',
        name: 'Sarah Chen',
        specialty: 'HIIT & Cardio',
        matchScore: 85,
        goalsScore: 82,
        styleScore: 87,
        motivationScore: 86
      },
      {
        id: '3', 
        name: 'Mike Rodriguez',
        specialty: 'Functional Fitness',
        matchScore: 78,
        goalsScore: 75,
        styleScore: 80,
        motivationScore: 79
      }
    ];
    
    setTimeout(() => {
      setMatches(mockMatches);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Finding your perfect matches...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Your Trainer Matches
        </h1>
        <p className="text-lg text-gray-600">
          We found {matches.length} trainers for you
        </p>
      </div>

      <div className="space-y-6">
        {matches.map((trainer) => (
          <div key={trainer.id} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">
                    {trainer.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{trainer.name}</h3>
                  <p className="text-gray-600">{trainer.specialty}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{trainer.matchScore}%</div>
                <div className="text-sm text-gray-500">Match Score</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-sm text-blue-600">Goals</div>
                <div className="font-bold text-lg">{trainer.goalsScore}</div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-sm text-green-600">Style</div>
                <div className="font-bold text-lg">{trainer.styleScore}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <div className="text-sm text-purple-600">Motivation</div>
                <div className="font-bold text-lg">{trainer.motivationScore}</div>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                View Profile
              </button>
              <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50">
                Message
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
