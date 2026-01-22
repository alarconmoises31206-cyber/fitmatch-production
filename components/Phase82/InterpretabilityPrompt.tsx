// components/Phase82/InterpretabilityPrompt.tsx
// PHASE 82: Interpretability Audit Prompt Component
// 
// Purpose: Display canonical interpretation questions to =10% of users
// Constraints:
// - Triggered AFTER user action (never before)
// - Once per user max (session-based)
// - Skip button always visible and equally prominent
// - Exactly one question per session
// - No free text, no follow-ups

import React, { useState, useEffect } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { getPhase82PromptModule, generateSessionId, PHASE82_PROMPT_VARIANTS, PromptVariantId } from '../../lib/phase82/interpretability-prompt';

interface InterpretabilityPromptProps {
  // Required: Session ID for sampling
  sessionId: string;
  
  // Required: Signal visibility state at time of action
  signalVisibilityState: 'visible' | 'hidden' | 'unknown';
  
  // Required: Callback after response or skip
  onComplete: () => void;
  
  // Optional: Custom styling
  className?: string;
}

const InterpretabilityPrompt: React.FC<InterpretabilityPromptProps> = ({
  sessionId,
  signalVisibilityState,
  onComplete,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<string>('');
  const [promptVariant, setPromptVariant] = useState<PromptVariantId | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Phase 82 prompt module
  const promptModule = getPhase82PromptModule(0.1); // =10% sampling

  useEffect(() => {
    // Phase 82: Check if this session should see a prompt
    const shouldShow = promptModule.shouldShowPrompt(sessionId);
    
    if (shouldShow) {
      // Phase 82: Select ONE prompt variant for this session
      const variant = promptModule.selectPromptVariant();
      setPromptVariant(variant);
      setIsVisible(true);
    } else {
      // Session not sampled or has already responded
      onComplete();
    }
  }, [sessionId, promptModule, onComplete]);

  const handleResponseSelect = (response: string) => {
    setSelectedResponse(response);
    setError(null); // Clear any previous errors
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
        // Successfully logged - close prompt
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
    // Phase 82: Skip button must be equally prominent
    // When skipped, we still mark the session as "shown" but don't log a response
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible || !promptVariant) {
    return null;
  }

  const promptConfig = PHASE82_PROMPT_VARIANTS[promptVariant];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
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

        {/* Content */}
        <div className="p-6">
          {/* Phase 82: Canonical question */}
          <p className="text-gray-700 mb-6">
            {promptConfig.question}
          </p>

          {/* Phase 82: Response options (no free text) */}
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

          {/* Error display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Phase 82: Skip button (equally prominent) */}
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

          {/* Phase 82: Privacy notice */}
          <p className="mt-4 text-xs text-gray-500 text-center">
            This helps us understand how our features are interpreted. Your response is anonymous and won't affect your experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterpretabilityPrompt;
