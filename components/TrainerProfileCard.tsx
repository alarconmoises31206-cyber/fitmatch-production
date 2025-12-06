// /components/TrainerProfileCard.tsx - UPDATED WITH PHASE 17 FEATURES
import React, { useState } from 'react';
import { 
  VerificationStatus, 
  VERIFICATION_BADGE_TEXTS, 
  VERIFICATION_COLORS,
  VERIFICATION_TOOLTIPS 
} from '@/lib/types/verification';


interface TrainerProfileCardProps {
  trainer: {
    id: string;
    first_name?: string;
    last_name?: string;
    headline?: string;
    specialties?: string[];
    match_score?: number;
    // Phase 17 additions
    subscription_status?: string;
    bio?: string;
    certifications?: string[];
    experience_years?: number;
    hourly_rate?: number;
  };
  score?: number;
  // Phase 17 additions
  onUnlock?: (trainerId: string) => Promise<void>;
  loading?: boolean;
}

export default function TrainerProfileCard({ 
  trainer, 
  score = trainer.match_score || 0,
  onUnlock,
  loading = false 
}: TrainerProfileCardProps) {
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async () => {
    if (!onUnlock || unlocking) return;
    
    setUnlocking(true);
    setError(null);
    
    try {
      await onUnlock(trainer.id);
    } catch (err: any) {
      setError(err.message || 'Failed to unlock trainer');
    } finally {
      setUnlocking(false);
    }
  };

  const displaySpecialties = trainer.specialties || ['Strength Training', 'Cardio', 'Wellness'];
  const matchPercentage = Math.round(score * 100);
  const subscriptionStatus = trainer.subscription_status || 'none';
  const isActive = subscriptionStatus === 'active';

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {trainer.first_name?.[0] || 'T'}{trainer.last_name?.[0] || ''}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {trainer.first_name || trainer.headline || 'Certified Fitness Trainer'}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2">
              {trainer.bio || trainer.headline || 'Professional fitness trainer'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">
            {matchPercentage}%
          </div>
          <div className="text-xs text-gray-500">Match</div>
        </div>
      </div>

      {displaySpecialties.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {displaySpecialties.slice(0, 3).map((specialty, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
            >
              {specialty}
            </span>
          ))}
        </div>
      )}

      {/* Phase 17: Additional Info */}
      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
        {trainer.experience_years && (
          <div>
            <span className="font-medium">{trainer.experience_years}</span> yrs
          </div>
        )}
        
        {trainer.certifications && trainer.certifications.length > 0 && (
          <div>
            <span className="font-medium">{trainer.certifications.length}</span> certs
          </div>
        )}
        
        {trainer.hourly_rate && (
          <div>
            <span className="font-medium">${trainer.hourly_rate}</span>/hr
          </div>
        )}
      </div>

      {/* Phase 17: Subscription Status */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-500">Status: </span>
            <span className={`font-medium ${
              isActive ? 'text-green-600' : 'text-amber-600'
            }`}>
              {isActive ? 'Available' : 'Subscription Required'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700">
              View Profile
            </button>
            
            {/* Phase 17: Unlock with Spin Button */}
            {onUnlock && (
              <button
                onClick={handleUnlock}
                disabled={unlocking || loading || !isActive}
                className={`flex-1 border py-2 px-3 rounded text-sm transition-colors ${
                  !isActive
                    ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                    : unlocking || loading
                    ? 'border-blue-300 text-blue-700 bg-blue-100 cursor-wait'
                    : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                }`}
              >
                {unlocking ? 'Unlocking...' : 'Unlock with Spin'}
              </button>
            )}
          </div>
        </div>

        {/* Phase 17: Error Message */}
        {error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Phase 17: Subscription Notice */}
        {!isActive && (
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded">
            <p className="text-sm text-amber-700">
              This trainer needs to activate their subscription to receive messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

