import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase/client';

interface Question {
  label: string;
  name: string;
  type: 'select' | 'number';
  options?: string[];
  min?: number;
  max?: number;
  maxLength?: number;
}

interface Step {
  title: string;
  questions: Question[];
}

interface Answers {
  [key: string]: string;
}

const STEPS: Step[] = [
  {
    title: 'Your Fitness Goals',
    questions: [
      { label: 'Primary Goal', name: 'goal_primary', type: 'select', options: ['weight_loss', 'muscle_gain', 'performance', 'rehab', 'general_health', 'other'] },
      { label: 'Desired Timeframe (weeks)', name: 'goal_timeframe_weeks', type: 'number', min: 1, max: 52 },
      { label: 'Target Intensity (1-5)', name: 'goal_intensity', type: 'select', options: ['1', '2', '3', '4', '5'] },
      { label: 'Progress Tracking Preference', name: 'goal_tracking_style', type: 'select', options: ['metrics', 'photos', 'feelings', 'performance', 'none'] }
    ]
  },
  {
    title: 'Your Experience Level',
    questions: [
      { label: 'Years of Training Experience', name: 'exp_years', type: 'number', maxLength: 2 },
      { label: 'Equipment Familiarity (1-5)', name: 'exp_equipment', type: 'select', options: ['1', '2', '3', '4', '5'] },
      { label: 'Comfort Working with Trainer (1-5)', name: 'exp_trainer_comfort', type: 'select', options: ['1', '2', '3', '4', '5'] }
    ]
  },
  {
    title: 'Motivation & Mindset',
    questions: [
      { label: 'Primary Motivation Type', name: 'motivation_type', type: 'select', options: ['accountability', 'education', 'competition', 'support', 'autonomy'] },
      { label: 'Response to Challenge (1-5)', name: 'motivation_challenge_response', type: 'select', options: ['1', '2', '3', '4', '5'] },
      { label: 'Trainer Energy Importance (1-5)', name: 'motivation_energy_need', type: 'select', options: ['1', '2', '3', '4', '5'] },
      { label: 'Preferred Coaching Tone', name: 'motivation_coaching_tone', type: 'select', options: ['strict', 'balanced', 'encouraging'] },
      { label: 'Biggest Obstacle', name: 'motivation_obstacle', type: 'select', options: ['time', 'confidence', 'knowledge', 'motivation', 'injury'] }
    ]
  },
  {
    title: 'Training Style Preferences',
    questions: [
      { label: 'Preferred Workout Format', name: 'style_format', type: 'select', options: ['strength', 'hiit', 'crossfit', 'functional', 'mixed'] },
      { label: 'Session Pacing (1-5)', name: 'style_pacing', type: 'select', options: ['1', '2', '3', '4', '5'] },
      { label: 'Structure vs Flexibility (1-5)', name: 'style_structure', type: 'select', options: ['1', '2', '3', '4', '5'] }
    ]
  },
  {
    title: 'Logistics & Practical Details',
    questions: [
      { label: 'Preferred Location', name: 'log_location', type: 'select', options: ['gym', 'home', 'outdoor', 'virtual'] },
      { label: 'Available Hours Per Week', name: 'log_hours_per_week', type: 'number', maxLength: 2 },
      { label: 'Budget Range', name: 'log_budget', type: 'select', options: ['low', 'medium', 'high'] },
      { label: 'Gender Preference for Trainer', name: 'log_gender_preference', type: 'select', options: ['male', 'female', 'none'] },
      { label: 'Preferred Language', name: 'log_language', type: 'select', options: ['en', 'es', 'fr', 'other'] }
    ]
  },
  {
    title: 'Communication Preferences',
    questions: [
      { label: 'Messaging Style Preference', name: 'comm_style', type: 'select', options: ['brief', 'detailed', 'motivational'] },
      { label: 'Communication Frequency', name: 'comm_frequency', type: 'select', options: ['daily', 'weekly', 'session_only'] }
    ]
  }
];

export default function Questionnaire() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auth protection
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login');
        return;
      }

      setAuthChecked(true);
    }

    checkAuth();
  }, [router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

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

  const handleNumberInput = (questionName: string, value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    const limited = numbersOnly.slice(0, 2);
    setAnswers(prev => ({ ...prev, [questionName]: limited }));
  };

  const handleSelect = (questionName: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionName]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Session expired. Please log in again.');
        setIsSubmitting(false);
        return;
      }

      // Check if questionnaire already exists
      const { data: existingQuestionnaire } = await supabase
        .from('client_questionnaire')
        .select('user_id')
        .eq('user_id', session.user.id)
        .single();

      if (existingQuestionnaire) {
        // Update existing questionnaire
        const { error: dbError } = await supabase
          .from('client_questionnaire')
          .update({
            ...answers,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', session.user.id);

        if (dbError) throw new Error(dbError.message);
      } else {
        // Create new questionnaire
        const { error: dbError } = await supabase
          .from('client_questionnaire')
          .insert({
            user_id: session.user.id,
            ...answers,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (dbError) throw new Error(dbError.message);
      }
      
      // Redirect to matches page
      router.push('/matches');
      
    } catch (error: any) {
      setError('Failed to submit: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepData = STEPS[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto p-6">
        {/* Simplified Progress - No percentages */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Fitness Profile Questionnaire</h1>
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>
          
          {/* Step dots */}
          <div className="flex justify-between items-center">
            {STEPS.map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className={`w-3 h-3 rounded-full ${
                    index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
                {index < STEPS.length - 1 && (
                  <div 
                    className={`w-12 h-1 -mt-1.5 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">{currentStepData.title}</h2>
          
          <div className="space-y-6">
            {currentStepData.questions.map((question, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <label className="block text-lg font-medium mb-3 text-gray-700">
                  {question.label}
                </label>
                
                {question.type === 'select' ? (
                  <select 
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    value={answers[question.name] || ''}
                    onChange={(e) => handleSelect(question.name, e.target.value)}
                  >
                    <option value="">Select an option</option>
                    {question.options?.map(option => (
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
                    placeholder={'Enter ' + question.label.toLowerCase()}
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
      </div>
    </div>
  );
}