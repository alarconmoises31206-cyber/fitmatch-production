import React from 'react';
import { Trainer } from '@/domain/schemas';

interface TrainerProfileCardProps {
  trainer: Trainer;
  onSelect?: () => void;
  className?: string,
}

const TrainerProfileCard: React.FC<TrainerProfileCardProps> = ({
  trainer,
  onSelect,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        {/* Trainer Avatar/Initials */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-indigo-600">
              {trainer.first_name?.[0]}{trainer.last_name?.[0]}
            </span>
          </div>
        </div>
        
        {/* Trainer Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {trainer.first_name} {trainer.last_name}
              </h3>
              {trainer.headline && (
                <p className="text-sm text-gray-600 mt-1">
                  {trainer.headline}
                </p>
              )}
            </div>
            
            {/* Rating or status badge could go here */}
          </div>
          
          {/* Bio Preview */}
          {trainer.bio && (
            <p className="mt-3 text-gray-700 line-clamp-2">
              {trainer.bio}
            </p>
          )}
          
          {/* Specialties */}
          {trainer.specialties && trainer.specialties.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {trainer.specialties.slice(0, 3).map((specialty, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {specialty}
                </span>
              ))}
              {trainer.specialties.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{trainer.specialties.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Action Button */}
      {onSelect && (
        <div className="mt-6">
          <button
            onClick={onSelect}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            View Profile
          </button>
        </div>
      )}
    </div>
  )
}

export default TrainerProfileCard;
