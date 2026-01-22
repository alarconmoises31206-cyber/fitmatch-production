import React from "react";

interface BoundaryDisclosureProps {
  showPersistenceNotice?: boolean;
  showPaymentNotice?: boolean;
}

const BoundaryDisclosure: React.FC<BoundaryDisclosureProps> = ({
  showPersistenceNotice = false,
  showPaymentNotice = false
}) => {
  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
        <div className="flex items-start">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
            <span className="text-gray-600 text-sm font-bold">i</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              System Evaluation Boundary Notice
            </h3>
            
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Current evaluation scope:</strong> Match recommendation engine and explanation system.
              </p>
              
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="font-medium text-gray-800 mb-1">In scope for evaluation:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Match compatibility algorithms</li>
                  <li>Explanation generation and presentation</li>
                  <li>Basic user interface interactions</li>
                </ul>
              </div>
              
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="font-medium text-gray-800 mb-1">Out of scope for current evaluation:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Payment processing systems</li>
                  <li>Trainer management tools</li>
                  <li>Complete onboarding workflows</li>
                  <li>Production data persistence</li>
                </ul>
              </div>
              
              {showPersistenceNotice && (
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <p className="text-yellow-800">
                    <strong>Note:</strong> Some data is stored locally for demonstration purposes only.
                    This data will not persist across browser sessions or devices.
                  </p>
                </div>
              )}
              
              {showPaymentNotice && (
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <p className="text-yellow-800">
                    <strong>Note:</strong> Payment-related buttons are demonstration elements only.
                    No actual payment processing occurs in this evaluation system.
                  </p>
                </div>
              )}
              
              <p className="text-xs text-gray-600 pt-2">
                This notice ensures clear interpretation of system capabilities during Phase 75 evaluation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoundaryDisclosure;
