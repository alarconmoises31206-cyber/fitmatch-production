import React from 'react';
import { MatchResult } from '@/types/match';

interface MatchCardProps {
  match: MatchResult;
  onViewProfile: (trainerId: string) => void;
  onStartConversation: (trainerId: string) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  onViewProfile, 
  onStartConversation 
}) => {
  const { trainer, score } = match;
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-xl font-bold">{trainer.first_name} {trainer.last_name}</h3>
      <p className="text-gray-600">{trainer.headline}</p>
      <div className="mt-2">
        <span className="text-2xl font-bold text-blue-600">{score}%</span>
        <span className="ml-2 text-gray-500">Match</span>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onViewProfile(trainer.id)}
          className="flex-1 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          View Profile
        </button>
        <button
          onClick={() => onStartConversation(trainer.id)}
          className="flex-1 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
        >
          Message
        </button>
      </div>
    </div>
  );
};

export default MatchCard;
