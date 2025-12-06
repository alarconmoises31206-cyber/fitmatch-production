'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STEPS = [
  {
    title: 'Your Fitness Goals',
    questions: [
      { label: 'Primary Goal', name: 'goal_primary', type: 'select', options: ['weight_loss', 'muscle_gain', 'performance', 'general_health'] },
      { label: 'Target Intensity (1-5)', name: 'goal_intensity', type: 'select', options: ['1', '2', '3', '4', '5'] }
    ]
  },
  {
    title: 'Your Experience', 
    questions: [
      { label: 'Years of Training', name: 'exp_years', type: 'number', maxLength: 2 },
      { label: 'Equipment Familiarity (1-5)', name: 'exp_equipment', type: 'select', options: ['1', '2', '3', '4', '5'] }
    ]
  }
];

export default function ClientQuestionnaire() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  // Number validation - only allow digits and limit to 2 characters
  const handleNumberInput = (questionName, value) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    const limited = numbersOnly.slice(0, 2);
    setAnswers(prev => ({ ...prev, [questionName]: limited }));
  };

  const handleSelect = (questionName, value) => {
    setAnswers(prev => ({ ...prev, [questionName]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('Submitting answers:', answers);
      
      // Test if API is reachable first
      const testResponse = await fetch('/api/questionnaire/client');
      if (!testResponse.ok) {
        throw new Error('API endpoint not reachable. Status: ' + testResponse.status);
      }
      
      const response = await fetch('/api/questionnaire/client', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          responses: answers,
          progress_percentage: 100
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('API Error: ' + (errorData.message || response.status));
      }
      
      const result = await response.json();
      console.log('Success:', result);
      
      alert('? Questionnaire Complete! Redirecting to your matches...');
      setTimeout(() => {
        router.push('/matches');
      }, 1500);
      
    } catch (error) {
      console.error('Submission error:', error);
      setError('Failed to submit: ' + error.message);
      alert('? API Error: ' + error.message + '. Check browser console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepData = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span>Step {currentStep + 1} of {STEPS.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
            style={{ width: progress + '%' }}
          ></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{currentStepData.title}</h2>
        
        <div className="space-y-6">
          {currentStepData.questions.map((question, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0">
              <label className="block text-lg font-medium mb-3 text-gray-700">
                {question.label}
                {question.type === 'number' && (
                  <span className="text-sm text-gray-500 ml-2">(numbers only, max 2 digits)</span>
                )}
              </label>
              
              {question.type === 'select' ? (
                <select 
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  value={answers[question.name] || ''}
                  onChange={(e) => handleSelect(question.name, e.target.value)}
                >
                  <option value="">Select an option</option>
                  {question.options.map(option => (
                    <option key={option} value={option}>
                      {option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  placeholder={question.type === 'number' ? 'Enter number (0-99)' : 'Enter value'}
                  value={answers[question.name] || ''}
                  onChange={(e) => handleNumberInput(question.name, e.target.value)}
                  maxLength={2}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t">
          <button 
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <button 
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? 'Saving...' : currentStep === STEPS.length - 1 ? 'Complete Questionnaire' : 'Next'}
          </button>
        </div>
      </div>

      {/* Debug panel */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <details>
          <summary className="cursor-pointer font-medium">Debug: Current Answers</summary>
          <pre className="mt-2 text-xs bg-white p-3 rounded border">{JSON.stringify(answers, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
}
