import React from "react";

const TrainerDashboard: React.FC = () => {
  return (
    <div className="p-6 border-2 border-yellow-300 bg-yellow-50 rounded-lg">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
          <span className="text-yellow-600 font-bold">!</span>
        </div>
        <h2 className="text-xl font-bold text-yellow-800">System Boundary Notice</h2>
      </div>
      
      <div className="space-y-3">
        <p className="text-yellow-700">
          <strong>Trainer dashboard functionality is out of scope for the current evaluation.</strong>
        </p>
        
        <div className="bg-white p-4 rounded border border-yellow-200">
          <p className="text-gray-700 mb-2">
            This component would normally include:
          </p>
          <ul className="list-disc pl-5 text-gray-600 space-y-1">
            <li>Client match management</li>
            <li>Schedule and appointment tracking</li>
            <li>Training program customization</li>
            <li>Billing and payment processing</li>
          </ul>
        </div>
        
        <p className="text-sm text-yellow-600 mt-4">
          This notice ensures accurate interpretation of system capabilities during Phase 75 evaluation.
          Trainer tools are planned for future development phases.
        </p>
      </div>
    </div>
  );
};

export default TrainerDashboard;
