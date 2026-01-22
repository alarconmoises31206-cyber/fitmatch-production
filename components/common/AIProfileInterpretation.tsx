// components/common/AIProfileInterpretation.tsx
import React from 'react';

interface AIProfileSummary {
  strengths: string[];
  goals: string[];
  preferences: string[];
  constraints: string[];
  red_flags?: string[];
  generated_at?: string;
  disclaimer?: string;
}

interface AIProfileInterpretationProps {
  summary: AIProfileSummary | null;
  isLoading?: boolean;
  profileType: 'client' | 'trainer';
}

export const AIProfileInterpretation: React.FC<AIProfileInterpretationProps> = ({
  summary,
  isLoading = false,
  profileType
}) => {
  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">
            AI Interpretation
          </h3>
          <span className="text-xs text-gray-500">Analyzing...</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">
            AI Interpretation
          </h3>
          <span className="text-xs text-gray-500">Not available</span>
        </div>
        <p className="text-sm text-gray-600">
          AI interpretation will be generated when you save your profile.
          This is for informational purposes only and does not affect matching.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-blue-100 rounded-lg p-4 bg-blue-50">
      {/* Header with clear disclaimer */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-blue-800">
            AI Interpretation
          </h3>
          <p className="text-xs text-blue-600 mt-1">
            For informational purposes only • Does not affect matching or pricing
          </p>
        </div>
        <span className="text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded">
          {profileType === 'client' ? 'Client Profile' : 'Trainer Profile'}
        </span>
      </div>

      {/* AI Summary Sections */}
      <div className="space-y-4">
        {summary.strengths.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-1">Strengths</h4>
            <div className="flex flex-wrap gap-1">
              {summary.strengths.map((strength, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                >
                  {strength}
                </span>
              ))}
            </div>
          </div>
        )}

        {summary.goals.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-1">Goals</h4>
            <div className="flex flex-wrap gap-1">
              {summary.goals.map((goal, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded"
                >
                  {goal}
                </span>
              ))}
            </div>
          </div>
        )}

        {summary.preferences.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-1">Preferences</h4>
            <div className="flex flex-wrap gap-1">
              {summary.preferences.map((preference, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
                >
                  {preference}
                </span>
              ))}
            </div>
          </div>
        )}

        {summary.constraints.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-1">Constraints</h4>
            <div className="flex flex-wrap gap-1">
              {summary.constraints.map((constraint, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded"
                >
                  {constraint}
                </span>
              ))}
            </div>
          </div>
        )}

        {summary.red_flags && summary.red_flags.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-1">Considerations</h4>
            <div className="flex flex-wrap gap-1">
              {summary.red_flags.map((flag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded"
                >
                  {flag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer with timestamp and refresh option */}
      <div className="mt-4 pt-3 border-t border-blue-200">
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {summary.generated_at && (
              <>Interpreted on {new Date(summary.generated_at).toLocaleDateString()}</>
            )}
          </div>
          <button
            type="button"
            className="text-xs text-blue-600 hover:text-blue-800"
            onClick={() => {
              // This would trigger a refresh in a real implementation
              console.log('Refresh AI interpretation');
            }}
          >
            Refresh analysis
          </button>
        </div>
        
        {/* Final disclaimer */}
        {summary.disclaimer && (
          <p className="text-xs text-gray-500 mt-2 italic">
            {summary.disclaimer}
          </p>
        )}
      </div>
    </div>
  );
};

// Hook for using AI interpretation
export function useAIInterpretation(profileType: 'client' | 'trainer', userId?: string) {
  const [summary, setSummary] = React.useState<AIProfileSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchInterpretation = React.useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/interpret-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_type: profileType,
          user_id: userId,
          // In a real implementation, we would fetch profile data here
          profile_data: {},
          questionnaire_data: {}
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.ai_summary);
      }
    } catch (error) {
      console.warn('Failed to fetch AI interpretation:', error);
      // Graceful degradation - continue without AI
    } finally {
      setIsLoading(false);
    }
  }, [userId, profileType]);

  React.useEffect(() => {
    fetchInterpretation();
  }, [fetchInterpretation]);

  return {
    summary,
    isLoading,
    refresh: fetchInterpretation
  };
}
