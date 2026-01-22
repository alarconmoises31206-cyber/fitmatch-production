// components/Phase80/MatchesPageWithSignal.tsx
// PHASE 80: Complete matches page integration with trust calibration

import React, { useState } from 'react';
import CompatibilitySignal from './CompatibilitySignal';
import { MessageCircle, Filter, Shield, Eye, EyeOff } from 'lucide-react';

// Mock data for demonstration
const MOCK_TRAINERS = [
  {
    id: '1',
    name: 'Alex Johnson',
    specialty: 'Strength Training',
    experience: '5 years',
    rate: '/hr',
    bio: 'I focus on sustainable strength building and proper form. My philosophy is about consistency over intensity.',
    compatibilityScore: 85
  },
  {
    id: '2',
    name: 'Maria Chen',
    specialty: 'Yoga & Mobility',
    experience: '8 years',
    rate: '/hr',
    bio: 'Mind-body connection through movement. I believe fitness should reduce stress, not add to it.',
    compatibilityScore: 62
  },
  {
    id: '3',
    name: 'David Park',
    specialty: 'Weight Loss',
    experience: '3 years',
    rate: '/hr',
    bio: 'Practical nutrition and exercise strategies for busy professionals. No gimmicks, just results.',
    compatibilityScore: 45
  },
  {
    id: '4',
    name: 'Sam Rivera',
    specialty: 'Senior Fitness',
    experience: '12 years',
    rate: '/hr',
    bio: 'Safe, effective exercise for older adults. Focus on maintaining independence and quality of life.',
    compatibilityScore: 28
  }
];

// Phase 80 Section 3: Explicit Non-Claims Component
const NonClaimsBanner: React.FC = () => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
    <div className="flex items-start gap-3">
      <Shield size={20} className="text-gray-500 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm text-gray-700 font-medium mb-1">
          Important to know:
        </p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• FitMatch does not predict success, recommend trainers, or judge compatibility.</li>
          <li>• The Compatibility Signal is one of many tools you can use while deciding for yourself.</li>
        </ul>
      </div>
    </div>
  </div>
);

// Phase 80 Section 6: Public Transparency Link Component
const TransparencyLink: React.FC = () => (
  <div className="mt-6 pt-6 border-t border-gray-200">
    <a 
      href="/how-fitmatch-uses-ai" 
      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
    >
      <Shield size={14} />
      How FitMatch uses AI
    </a>
    <p className="text-xs text-gray-500 mt-1">
      Learn about our approach to AI transparency and user control
    </p>
  </div>
);

const MatchesPageWithSignal: React.FC = () => {
  const [showSignals, setShowSignals] = useState(true);
  const [sortBy, setSortBy] = useState<'default' | 'price' | 'experience'>('default');
  
  // Phase 80 Section 4: UI Behavior Constraint - Never sort by compatibility score
  const sortedTrainers = [...MOCK_TRAINERS].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return parseInt(a.rate.replace(/[^0-9]/g, '')) - parseInt(b.rate.replace(/[^0-9]/g, ''));
      case 'experience':
        return parseInt(b.experience) - parseInt(a.experience);
      default:
        return 0; // Default order, not by compatibility score
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Available Trainers
          </h1>
          <p className="text-gray-600">
            Review trainers that match your criteria. Message any trainer to start a conversation.
          </p>
        </header>

        {/* Phase 80 Section 3: Non-Claims Banner */}
        <NonClaimsBanner />

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('default')}
                className={\px-3 py-1.5 text-sm rounded-md \\}
              >
                Default
              </button>
              <button
                onClick={() => setSortBy('price')}
                className={\px-3 py-1.5 text-sm rounded-md \\}
              >
                Price
              </button>
              <button
                onClick={() => setSortBy('experience')}
                className={\px-3 py-1.5 text-sm rounded-md \\}
              >
                Experience
              </button>
              
              {/* Phase 80: Never show sort by compatibility score button */}
              {/* This is intentionally omitted to enforce the constraint */}
            </div>
          </div>

          {/* Phase 80: User can hide the signal */}
          <button
            onClick={() => setShowSignals(!showSignals)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            {showSignals ? <EyeOff size={16} /> : <Eye size={16} />}
            {showSignals ? 'Hide Signals' : 'Show Signals'}
          </button>
        </div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedTrainers.map((trainer) => (
            <div
              key={trainer.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Trainer Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {trainer.name}
                        </h3>
                        <p className="text-sm text-gray-600">{trainer.specialty}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{trainer.rate}</div>
                        <div className="text-sm text-gray-500">per hour</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700">
                        {trainer.experience} experience
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-50 text-green-700">
                        Available
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {trainer.bio}
                    </p>

                    {/* Phase 80: Message button always enabled regardless of score */}
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      <MessageCircle size={18} />
                      Message {trainer.name.split(' ')[0]}
                    </button>
                  </div>

                  {/* Phase 80: Compatibility Signal - Right side */}
                  {showSignals && (
                    <div className="md:w-64">
                      <CompatibilitySignal
                        score={trainer.compatibilityScore}
                        showDetailed={true}
                        onHide={() => setShowSignals(false)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Phase 80 Section 6: Transparency Link */}
        <TransparencyLink />

        {/* Phase 80 Section 4: UI Behavior Constraints Notice (for developers) */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-2">
                Phase 80 UI Constraints Active
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Compatibility Signal never auto-sorts results</li>
                <li>• Signal never blocks messaging or filters profiles</li>
                <li>• Signal never appears as a badge or rank</li>
                <li>• Signal never framed as a recommendation</li>
                <li>• User can hide or ignore the signal</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchesPageWithSignal;
