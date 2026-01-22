// components/Phase80/CompatibilitySignalWithPrompt.tsx
// Example integration of Phase 82 Interpretability Prompt with Phase 80 Compatibility Signal
// 
// This shows how to trigger Phase 82 prompt AFTER user actions

import React, { useState, useEffect } from 'react';
import CompatibilitySignal from './CompatibilitySignal';
import InterpretabilityPrompt from '../Phase82/InterpretabilityPrompt';
import { generateSessionId } from '../../lib/phase82/interpretability-prompt';

// Extended props to include Phase 82 integration
interface CompatibilitySignalWithPromptProps {
  score: number;
  userId?: string;
  trainerId?: string;
  context?: 'matches' | 'profile' | 'detail';
}

const CompatibilitySignalWithPrompt: React.FC<CompatibilitySignalWithPromptProps> = ({
  score,
  userId,
  trainerId,
  context = 'matches'
}) => {
  // Phase 82: Session management
  const [sessionId, setSessionId] = useState<string>('');
  const [signalVisible, setSignalVisible] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [userActionTaken, setUserActionTaken] = useState(false);
  const [actionType, setActionType] = useState<'message' | 'view' | 'hide' | null>(null);

  // Initialize session on component mount
  useEffect(() => {
    // Generate or retrieve session ID
    const storedSessionId = localStorage.getItem('phase82_session_id') || generateSessionId();
    localStorage.setItem('phase82_session_id', storedSessionId);
    setSessionId(storedSessionId);
  }, []);

  // Phase 82: Track signal visibility
  const handleToggleSignal = () => {
    const newVisibility = !signalVisible;
    setSignalVisible(newVisibility);
    
    // Phase 82: This is a user action that could trigger a prompt
    setActionType('hide');
    setUserActionTaken(true);
    
    // In a real implementation, you would log this to Phase 81 UAI events
    console.log('Signal visibility toggled:', newVisibility ? 'visible' : 'hidden');
  };

  // Phase 82: Handle user actions that could trigger interpretability prompt
  const handleSendMessage = () => {
    // This would be your actual message sending logic
    console.log('Message sent to trainer:', trainerId);
    
    // Phase 82: Set action for potential prompt triggering
    setActionType('message');
    setUserActionTaken(true);
    
    // Show prompt after action (Phase 82 requirement)
    setTimeout(() => {
      setShowPrompt(true);
    }, 500); // Small delay to ensure action is complete
  };

  const handleViewProfile = () => {
    console.log('Profile viewed:', trainerId);
    
    setActionType('view');
    setUserActionTaken(true);
    
    setTimeout(() => {
      setShowPrompt(true);
    }, 500);
  };

  // Phase 82: Handle prompt completion
  const handlePromptComplete = () => {
    setShowPrompt(false);
    setUserActionTaken(false);
    setActionType(null);
  };

  // Determine signal visibility state for Phase 82
  const getSignalVisibilityState = (): 'visible' | 'hidden' | 'unknown' => {
    return signalVisible ? 'visible' : 'hidden';
  };

  return (
    <>
      {/* Original Compatibility Signal Component */}
      <div className="relative">
        <CompatibilitySignal 
          score={score}
          onToggleVisibility={handleToggleSignal}
          isVisible={signalVisible}
        />
        
        {/* Example action buttons that could trigger Phase 82 prompt */}
        <div className="mt-4 flex space-x-3">
          <button
            onClick={handleViewProfile}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            View Full Profile
          </button>
          
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Send Message
          </button>
        </div>
      </div>

      {/* Phase 82 Interpretability Prompt */}
      {showPrompt && sessionId && userActionTaken && actionType && (
        <InterpretabilityPrompt
          sessionId={sessionId}
          signalVisibilityState={getSignalVisibilityState()}
          onComplete={handlePromptComplete}
        />
      )}

      {/* Phase 82 Integration Notes */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm">
        <h4 className="font-semibold text-gray-700 mb-2">Phase 82 Integration Notes:</h4>
        <ul className="text-gray-600 space-y-1">
          <li>• Prompt appears AFTER user actions (message, view, hide)</li>
          <li>• =10% of sessions will see the prompt</li>
          <li>• Once per session maximum</li>
          <li>• Skip button is equally prominent</li>
          <li>• No real-time adaptation based on responses</li>
        </ul>
      </div>
    </>
  );
};

export default CompatibilitySignalWithPrompt;
