// components/external-trainers/ExternalTrainerCard.tsx
import React from 'react';
import { MatchResult } from '../../infra/ai-matchmaking/types';
import { EnhancedMatchResult } from '../../infra/external-trainers/types';

interface ExternalTrainerCardProps {
  match: MatchResult & Partial<EnhancedMatchResult>;,
  onContact: () => void;
  onViewDetails: () => void,
}

const ExternalTrainerCard: React.FC<ExternalTrainerCardProps> = ({
  match,
  onContact,
  onViewDetails
}) => {
  
  const isExternal: any= match.isExternal === true,
  
  // Determine badge styling
  const getBadgeStyles: any= () => {
    if (isExternal) {
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-200',
  label: 'Not on FitMatch yet'
      }
    } else {
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        label: 'Verified Trainer'
      }
    }
  }

  const badge: any= getBadgeStyles()

  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold">
            {isExternal ? 'External Trainer' : 'FitMatch Trainer'}
          </h3>
          <div className="flex items-center mt-1">
            <span className={`text-xs px-2 py-1 rounded-full ${badge.bg} ${badge.text} ${badge.border} border`}>
              {badge.label}
            </span>
            <span className="ml-2 text-sm text-gray-600">
              Score: <span className="font-bold">{match.score}/100</span>
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{match.score}</div>
          <div className="text-xs text-gray-500">match score</div>
        </div>
      </div>

      {/* Match breakdown (simplified for external trainers) */}
      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Compatibility Breakdown:</div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600">Goals</div>
            <div className="font-bold">{match.breakdown.goals}%</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600">Experience</div>
            <div className="font-bold">{match.breakdown.experience}%</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600">Specialties</div>
            <div className="font-bold">{match.breakdown.specialties}%</div>
          </div>
        </div>
      </div>

      {/* Explanation/rationale */}
      <div className="mb-4">
        <div className="text-sm text-gray-700 line-clamp-2">
          {match.rationale?.split('\n')[0] || 'Compatibility match based on your profile.'}
        </div>
        {isExternal && (
          <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
            ⚠️ This trainer is not yet on FitMatch. You can send one introductory message.
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center pt-3 border-t">
        <button
          onClick={onViewDetails}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View full details →
        </button>
        
        <div className="flex space-x-2">
          {isExternal ? (
            <>
              <button
                onClick={onContact}
                className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 transition-colors"
              >
                Send Message
              </button>
              <div className="text-xs text-gray-500 self-center">
                Free • 1 message only
              </div>
            </>
          ) : (
            <button
              onClick={onContact}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              {match.tokenCostEstimate ? `Contact (${match.tokenCostEstimate} tokens)` : 'Contact'}
            </button>
          )}
        </div>
      </div>

      {/* Limitations for external trainers */}
      {isExternal && (
        <div className="mt-3 pt-3 border-t border-dashed text-xs text-gray-600">
          <div className="font-medium mb-1">Limitations:</div>
          <ul className="list-disc list-inside space-y-1">
            <li>One introductory message only</li>
            <li>Trainer must join FitMatch to reply</li>
            <li>No attachments or off-platform links allowed</li>
            <li>Message length limited to 500 characters</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default ExternalTrainerCard;
