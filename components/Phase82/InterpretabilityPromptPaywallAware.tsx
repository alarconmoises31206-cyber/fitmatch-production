// components/Phase82/InterpretabilityPromptPaywallAware.tsx
// Phase 82 prompt with paywall checking
// Prevents sampling users who cannot access Compatibility Signal features

import React, { useState, useEffect } from 'react';
import { X, HelpCircle, Lock } from 'lucide-react';
import { getPhase82PromptModule, generateSessionId, PHASE82_PROMPT_VARIANTS, PromptVariantId } from '../../lib/phase82/interpretability-prompt';

interface InterpretabilityPromptPaywallAwareProps {
  sessionId: string;
  signalVisibilityState: 'visible' | 'hidden' | 'unknown';
  onComplete: () => void;
  className?: string;
  
  // Paywall state - must be provided by parent component
  hasSignalAccess: boolean; // Can user see Compatibility Signal?
  hasMessagingAccess: boolean; // Can user send messages?
  hasProfileAccess: boolean; // Can user view profiles?
}

const InterpretabilityPromptPaywallAware: React.FC<InterpretabilityPromptPaywallAwareProps> = ({
  sessionId,
  signalVisibilityState,
  onComplete,
  className = '',
  hasSignalAccess,
  hasMessagingAccess,
  hasProfileAccess
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<string>('');
  const [promptVariant, setPromptVariant] = useState<PromptVariantId | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessCheckPassed, setAccessCheckPassed] = useState(false);

  const promptModule = getPhase82PromptModule(0.1);

  useEffect(() => {
    // PHASE 82 PAYWALL CHECK: Only sample users with access to Compatibility Signal features
    const canUserBeSampled = hasSignalAccess && (hasMessagingAccess || hasProfileAccess);
    
    if (!canUserBeSampled) {
      console.log('Phase 82: User excluded from sampling due to paywall restrictions');
      onComplete();
      return;
    }

    setAccessCheckPassed(true);
    
    // Phase 82: Check if this session should see a prompt
    const shouldShow = promptModule.shouldShowPrompt(sessionId);
    
    if (shouldShow) {
      const variant = promptModule.selectPromptVariant();
      setPromptVariant(variant);
      setIsVisible(true);
    } else {
      onComplete();
    }
  }, [sessionId, promptModule, onComplete, hasSignalAccess, hasMessagingAccess, hasProfileAccess]);

  // ... rest of component remains the same as InterpretabilityPrompt.tsx
  const handleResponseSelect = (response: string) => {
    setSelectedResponse(response);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedResponse || !promptVariant) {
      setError('Please select a response');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await promptModule.logInterpretationEvent(
        sessionId,
        signalVisibilityState,
        PHASE82_PROMPT_VARIANTS[promptVariant].id,
        selectedResponse
      );

      if (result.success) {
        setIsVisible(false);
        onComplete();
      } else {
        setError(result.error || 'Failed to log response');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsSubmitting(false);
      console.error('Phase 82 prompt submission error:', err);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible || !promptVariant || !accessCheckPassed) {
    return null;
  }

  const promptConfig = PHASE82_PROMPT_VARIANTS[promptVariant];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Help us understand
            </h3>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-6">
            {promptConfig.question}
          </p>

          <div className="space-y-3 mb-6">
            {promptConfig.responses.map((response) => (
              <label
                key={response}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedResponse === response
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="interpretation-response"
                  value={response}
                  checked={selectedResponse === response}
                  onChange={() => handleResponseSelect(response)}
                  className="mr-3 h-4 w-4 text-blue-600"
                />
                <span className="text-gray-700">{response}</span>
              </label>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Skip
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!selectedResponse || isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-500 text-center">
            This helps us understand how our features are interpreted. Your response is anonymous and won't affect your experience.
          </p>
          
          {/* Paywall access indicator (for debugging) */}
          <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-500">
            <div className="flex items-center justify-between">
              <span>Signal Access: {hasSignalAccess ? '?' : '?'}</span>
              <span>Messaging: {hasMessagingAccess ? '?' : '?'}</span>
              <span>Profiles: {hasProfileAccess ? '?' : '?'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterpretabilityPromptPaywallAware;
