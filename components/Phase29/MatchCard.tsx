import React from 'react';
// src/components/Phase29/MatchCard.tsx - FIXED VERSION
// Phase 29: Main match presentation card
import { MatchResult } from '@/types/match';
import React, { useState } from 'react';
import CompatibilityBreakdown from './CompatibilityBreakdown';
import ConfidenceBar from './ConfidenceBar';
import ExplanationPanel from './ExplanationPanel';
import MatchTierBadge from './MatchTierBadge';

export interface MatchCardProps {
  match: MatchResult;
  onViewProfile: (trainerId: string) => void;,
  onStartConversation: (trainerId: string, match: MatchResult) => void;
  className?: string,
}

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onViewProfile,
  onStartConversation,
  className = ''
}) => {
  
  const [isExpanded, setIsExpanded] = useState(false)
  const { trainer, score, confidence, tier, explanation, compatibilityBreakdown } = match;

  // Build trust signals from trainer data - using safe property access
  const trustSignals: any= [
    // Use optional chaining and fallbacks
    trainer.experience_years && {
      label: `${trainer.experience_years}+ years experience`,
      icon: '??'
    },
    trainer.specialties && trainer.specialties.length > 0 && {
      label: `Specializes in: ${trainer.specialties.slice(0, 2).join(', ')}`,
      icon: '??'
    },
    trainer.verified_status === 'verified' && {
      label: 'Verified Trainer',
      icon: '?'
    },
    trainer.niche_tags && trainer.niche_tags.length > 0 && {
      label: `Niche: ${trainer.niche_tags.slice(0, 2).join(', ')}`,
      icon: '???'
    }
  ].filter(Boolean) as { label: string, icon: string }[];

  // Fix compatibility breakdown type issue with null check
  const safeCompatibilityBreakdown: any= (compatibilityBreakdown || []).map(item => ({
    ...item,
    matchLevel: item.matchLevel === 'not-applicable' ? 'neutral' : item.matchLevel
  })).filter(item => 
    item.matchLevel === 'low' || 
    item.matchLevel === 'medium' || 
    item.matchLevel === 'high' || 
    item.matchLevel === 'neutral'
  )

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      {/* Card Header */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          {/* Trainer Info */}
          <div className="flex-1">
            <div className="flex items-start gap-4">
              {/* Trainer Avatar */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl">
                  {trainer.first_name?.[0] || 'T'}
                </div>
              </div>

              {/* Trainer Details */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {trainer.first_name} {trainer.last_name}
                  </h3>
                  <MatchTierBadge tier={tier} />
                </div>
                
                <p className="text-gray-600 mb-3">{trainer.headline}</p>
                
                {/* Trust Signals */}
                {trustSignals.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {trustSignals.map((signal, index) => (
                      signal && (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md text-sm text-gray-700"
                        >
                          <span>{signal.icon}</span>
                          <span>{signal.label}</span>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Score Section */}
          <div className="md:w-48">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-gray-900">{score}</div>
              <div className="text-sm text-gray-600">Match Score</div>
            </div>
            <ConfidenceBar score={score} confidence={confidence} />
          </div>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-3 border-t border-gray-200 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-900">
          {isExpanded ? 'Hide details' : 'Show match details'}
        </span>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-200 space-y-6">
          {/* Explanation Panel */}
          <div>
            <ExplanationPanel
              summary={explanation.summary}
              considered={explanation.considered}
              notConsidered={explanation.notConsidered}
            />
          </div>

          {/* Compatibility Breakdown */}
          {safeCompatibilityBreakdown.length > 0 && (
            <div>
              <CompatibilityBreakdown items={safeCompatibilityBreakdown} />
            </div>
          )}

          {/* Trainer Philosophy & Best Fit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trainer.coaching_philosophy && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-2">Coaching Philosophy</h5>
                <p className="text-sm text-gray-700">{trainer.coaching_philosophy}</p>
              </div>
            )}
            
            {trainer.works_best_with && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-2">Works Best With Clients Who</h5>
                <p className="text-sm text-gray-700">{trainer.works_best_with}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => onViewProfile(trainer.id)}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              View Trainer Profile
            </button>
            <button
              onClick={() => onStartConversation(trainer.id, match)}
              className="flex-1 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors text-center"
            >
              Start Conversation
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MatchCard;
