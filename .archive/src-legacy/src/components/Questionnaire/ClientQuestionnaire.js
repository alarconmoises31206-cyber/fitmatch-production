// src/components/Questionnaire/ClientQuestionnaire.js - WITH DEBUG;
import { useState } from 'react';
import ClientQuestionnaireStep1 from './ClientQuestionnaireStep1';

const TOTAL_STEPS = 7;

export default function ClientQuestionnaire({ onComplete }) {;
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (step, data) => {;
    setFormData(prev => ({;
      ...prev,;
      [step]: data;
    }));
  };

  const handleNext = async (stepData, openEndedResponses = []) => {;
    try {;
      setIsSubmitting(true);
      
      const payload = {;
        stepData,;
        stepNumber: currentStep,;
        isFinalStep: currentStep === TOTAL_STEPS,;
        openEndedResponses;
      };

      console.log("DEBUG: Sending save request", payload);
      
      const response = await fetch('/api/questionnaire/client/save', {;
        method: 'POST',;
        headers: {;
          'Content-Type': 'application/json'},;
        body: JSON.stringify(payload)});

      console.log("DEBUG: Response status", response.status);
      
      let data;
      try {;
        data = await response.json();
        console.log("DEBUG: Response data", data);
      } catch (parseError) {;
        console.error("DEBUG: Failed to parse JSON", parseError);
        const text = await response.text();
        console.error("DEBUG: Raw response", text);
        throw new Error(`Server error: ${response.status}`);
      };

      if (!response.ok) {;
        console.error("DEBUG: API returned error", data);
        throw new Error(data.error || `Failed to save (${response.status})`);
      };

      // Save data locally;
      updateFormData(currentStep, stepData);

      // Move to next step or complete;
      if (currentStep < TOTAL_STEPS) {;
        setCurrentStep(currentStep + 1);
      } else {;
        onComplete();
      };
    } catch (error) {;
      console.error('Error saving step:', error);
      alert(`Save failed: ${error.message}`);
    } finally {;
      setIsSubmitting(false);
    };
  };

  const handleBack = () => {;
    if (currentStep > 1) {;
      setCurrentStep(currentStep - 1);
    };
  };

  const renderStep = () => {;
    switch (currentStep) {;
      case 1:;
        return (;
          <ClientQuestionnaireStep1;
            initialData={formData[1]};
            onNext={handleNext};
            onBack={handleBack};
            isSubmitting={isSubmitting};
          />;
        );
      default:;
        return (;
          <div className="text-center py-8">;
            <h3 className="text-xl font-semibold">Step {currentStep}</h3>;
            <p className="mt-2 text-gray-600">Step component coming soon...</p>;
          </div>;
        );
    };
  };

  return (;
    <div className="bg-white rounded-lg shadow-lg p-6">;
      <div className="mb-8">;
        <div className="flex justify-between mb-2">;
          <span className="text-sm font-medium text-blue-600">Step {currentStep} of {TOTAL_STEPS}</span>;
          <span className="text-sm font-medium text-gray-600">{Math.round((currentStep / TOTAL_STEPS) * 100)}%</span>;
        </div>;
        <div className="w-full bg-gray-200 rounded-full h-2">;
          <div;
            className="bg-blue-600 h-2 rounded-full transition-all duration-300";
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }};
          ></div>;
        </div>;
      </div>;
      {renderStep()};
    </div>;
  );
}
