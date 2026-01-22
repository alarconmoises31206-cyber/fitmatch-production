// components/Phase80/CompatibilitySignal.tsx
// PHASE 80: User-Facing Meaning & Trust Calibration
// UPDATED FOR PHASE 81: User Agency Instrumentation

import React, { useState, useEffect } from 'react';
import { Info, X, AlertCircle } from 'lucide-react';
import { userAgencyInstrumentation, ContextType, UserMode } from '../../src/services/user-agency-instrumentation';

// Phase 80 Section 1: Canonical Definition (LOCKED)
const CANONICAL_DEFINITION = "A Compatibility Signal is a numeric summary of how similar two people's written descriptions are in limited areas. It does not evaluate quality, predict outcomes, or recommend decisions.";

// Phase 80 Section 2: Required UI Copy (CANONICAL TEXT)
const UI_COPY = {
  // A. Primary Label (Locked)
  primaryLabel: "Compatibility Signal",
  
  // B. Always-Visible Tooltip (Required)
  tooltip: {
    title: "What this means",
    content: "This signal reflects how similar certain written responses are between you and this profile. It does not evaluate quality, safety, or likelihood of success."
  },
  
  // C. Inline Explanation (Shown Near Score)
  inlineExplanation: "This number reflects similarity in language used in a few open-ended responses. It's meant to help exploration, not to make decisions for you.",
  
  // D. Expanded Explanation (Modal / 'Learn more')
  expandedExplanation: {
    title: "How this signal works",
    points: [
      "FitMatch compares some written answers (such as goals or coaching philosophy) and measures how similar the language is.",
      "It does not evaluate experience, certifications, professionalism, availability, or outcomes.",
      "A higher number does not mean 'better' — it only means the text was more similar.",
      "You should always review profiles and talk directly before deciding."
    ]
  }
};

// Phase 80 Section 3: Explicit Non-Claims (MANDATORY DISCLOSURE)
const NON_CLAIMS = [
  "FitMatch does not predict success, recommend trainers, or judge compatibility.",
  "The Compatibility Signal is one of many tools you can use while deciding for yourself."
];

// Phase 80 Section 5: Failure Modes — REQUIRED DISCLOSURE
const FAILURE_MODES = [
  "Similar wording does not mean similar coaching quality.",
  "Style alignment does not guarantee results.",
  "This signal does not account for pricing, availability, or logistics."
];

interface CompatibilitySignalProps {
  score: number; // 0-100
  showDetailed?: boolean;
  onHide?: () => void;
  className?: string;
  userMode?: UserMode;
  context?: ContextType;
  trainerId?: string; // For instrumentation
}

const CompatibilitySignal: React.FC<CompatibilitySignalProps> = ({
  score,
  showDetailed = false,
  onHide,
  className = '',
  userMode = 'client',
  context = 'matches',
  trainerId
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentFailureMode, setCurrentFailureMode] = useState(0);
  const [isSignalVisible, setIsSignalVisible] = useState(true);

  // PHASE 81: Log initial signal view
  useEffect(() => {
    userAgencyInstrumentation.logSignalViewed(userMode, context, score)
      .catch(error => console.error('Phase 81 instrumentation error:', error));
  }, []);

  // Rotate failure modes every 5 seconds if detailed view
  useEffect(() => {
    if (!showDetailed) return;
    
    const interval = setInterval(() => {
      setCurrentFailureMode((prev) => (prev + 1) % FAILURE_MODES.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [showDetailed]);

  // Phase 80 Section 4: UI Behavior Constraints are enforced here
  // The component never sorts, filters, blocks, or recommends

  const getScoreColor = (score: number) => {
    // Neutral colors only - no green/red implication of quality
    if (score >= 70) return "text-blue-600";
    if (score >= 40) return "text-blue-500";
    return "text-gray-500";
  };

  const getScoreBackground = (score: number) => {
    // Neutral backgrounds only
    if (score >= 70) return "bg-blue-50";
    if (score >= 40) return "bg-blue-50";
    return "bg-gray-50";
  };

  // PHASE 81: Event handlers with instrumentation
  const handleHideSignal = () => {
    userAgencyInstrumentation.logSignalHidden(userMode, context)
      .catch(error => console.error('Phase 81 instrumentation error:', error));
    
    setIsSignalVisible(false);
    if (onHide) onHide();
  };

  const handleShowSignal = () => {
    userAgencyInstrumentation.logSignalShown(userMode, context)
      .catch(error => console.error('Phase 81 instrumentation error:', error));
    
    setIsSignalVisible(true);
  };

  const handleTooltipToggle = (visible: boolean) => {
    if (visible) {
      userAgencyInstrumentation.logSignalTooltipOpened(userMode, context)
        .catch(error => console.error('Phase 81 instrumentation error:', error));
    }
    setShowTooltip(visible);
  };

  const handleModalOpen = () => {
    userAgencyInstrumentation.logSignalModalOpened(userMode, context)
      .catch(error => console.error('Phase 81 instrumentation error:', error));
    
    setShowModal(true);
  };

  // PHASE 81: Function to log profile view after signal
  const logProfileViewAfterSignal = () => {
    userAgencyInstrumentation.logProfileViewedAfterSignal(userMode, context, score)
      .catch(error => console.error('Phase 81 instrumentation error:', error));
  };

  return (
    <div className={\\\}>
      {/* Phase 80: User can hide the signal */}
      {onHide && isSignalVisible && (
        <div className="flex justify-end mb-2">
          <button
            onClick={handleHideSignal}
            className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1"
            aria-label="Hide compatibility signal"
          >
            <X size={14} />
            Hide signal
          </button>
        </div>
      )}

      {/* Show signal button if hidden */}
      {!isSignalVisible && (
        <div className="mb-2">
          <button
            onClick={handleShowSignal}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            aria-label="Show compatibility signal"
          >
            Show compatibility signal
          </button>
        </div>
      )}

      {/* Main signal display (only if visible) */}
      {isSignalVisible && (
        <div className={\p-4 rounded-lg \ border border-gray-200\}>
          {/* Header with label and tooltip */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">
                {UI_COPY.primaryLabel}
              </h3>
              
              {/* Always-visible tooltip trigger */}
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => handleTooltipToggle(!showTooltip)}
                onMouseEnter={() => handleTooltipToggle(true)}
                onMouseLeave={() => handleTooltipToggle(false)}
                aria-label="Learn about compatibility signal"
              >
                <Info size={16} />
              </button>
            </div>
            
            <div className="text-right">
              <div className={\	ext-2xl font-bold \\}>
                {score}
                <span className="text-sm font-normal text-gray-500">/100</span>
              </div>
            </div>
          </div>

          {/* Tooltip (always visible when active) */}
          {showTooltip && (
            <div className="mb-3 p-3 bg-white border border-gray-300 rounded-md shadow-sm">
              <div className="font-medium text-gray-900 text-sm mb-1">
                {UI_COPY.tooltip.title}
              </div>
              <p className="text-sm text-gray-600">
                {UI_COPY.tooltip.content}
              </p>
            </div>
          )}

          {/* Inline explanation */}
          <p className="text-sm text-gray-600 mb-3">
            {UI_COPY.inlineExplanation}
          </p>

          {/* Learn more link */}
          <button
            onClick={handleModalOpen}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Learn how this signal works
          </button>

          {/* Phase 80 Section 5: Failure Mode Disclosure */}
          {showDetailed && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  {FAILURE_MODES[currentFailureMode]}
                </p>
              </div>
            </div>
          )}

          {/* Phase 80 Section 3: Explicit Non-Claims */}
          {showDetailed && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 italic">
                {NON_CLAIMS[0]}
              </p>
              <p className="text-xs text-gray-500 italic mt-1">
                {NON_CLAIMS[1]}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Expanded Explanation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {UI_COPY.expandedExplanation.title}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {UI_COPY.expandedExplanation.points.map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <p className="text-gray-700">{point}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-700 font-medium mb-2">
                Remember:
              </p>
              <p className="text-sm text-gray-600">
                {CANONICAL_DEFINITION}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                I understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// PHASE 81: Higher-order component to add instrumentation to message sending
export function withMessageInstrumentation(
  WrappedComponent: React.ComponentType<any>,
  userMode: UserMode = 'client',
  context: ContextType = 'matches'
) {
  return function InstrumentedComponent(props: any) {
    const handleMessageSent = (signalValue?: number, isSignalVisible?: boolean) => {
      // Log appropriate event based on signal visibility and value
      if (isSignalVisible === false) {
        userAgencyInstrumentation.logMessageSentWithSignalHidden(userMode, context)
          .catch(error => console.error('Phase 81 instrumentation error:', error));
      } else if (signalValue !== undefined) {
        userAgencyInstrumentation.logMessageSentWithSignalVisible(userMode, context, signalValue)
          .catch(error => console.error('Phase 81 instrumentation error:', error));
        
        // Also log high/low categorization (internal only)
        if (signalValue < 40) {
          userAgencyInstrumentation.logMessageSentLowSignal(userMode, context, signalValue)
            .catch(error => console.error('Phase 81 instrumentation error:', error));
        } else if (signalValue >= 70) {
          userAgencyInstrumentation.logMessageSentHighSignal(userMode, context, signalValue)
            .catch(error => console.error('Phase 81 instrumentation error:', error));
        }
      }
      
      // Call original message handler if it exists
      if (props.onMessageSent) {
        props.onMessageSent();
      }
    };

    return <WrappedComponent {...props} onMessageSent={handleMessageSent} />;
  };
}

// Phase 80 Section 7: Director Sign-Off Statement Component
// This would be used in internal documentation, not in UI
export const Phase80DirectorSignOff: React.FC = () => (
  <div className="hidden">
    {/* This component is for documentation purposes only */}
    <p>
      Phase 80 locks the meaning of the Compatibility Signal.
      Any future change that alters how users interpret this signal constitutes a new phase and requires explicit review.
    </p>
  </div>
);

export default CompatibilitySignal;
