import { useState } from 'react';
import { useForm } from 'react-hook-form';

const STEPS = [
  { title: 'Goals', fields: ['goal_primary', 'goal_timeframe_weeks', 'goal_intensity', 'goal_tracking_style'] },
  { title: 'Experience', fields: ['exp_years', 'exp_equipment', 'exp_trainer_comfort'] },
  { title: 'Motivation', fields: ['motivation_type', 'motivation_challenge_response', 'motivation_energy_need', 'motivation_coaching_tone', 'motivation_obstacle'] },
  { title: 'Training Style', fields: ['style_format', 'style_pacing', 'style_structure'] },
  { title: 'Logistics', fields: ['log_location', 'log_hours_per_week', 'log_budget', 'log_gender_preference', 'log_language'] },
  { title: 'Communication', fields: ['comm_style', 'comm_frequency'] }
];

export default function ClientQuestionnaire() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const updateProgress = (data) => {
    const completedFields = Object.keys(data).filter(key => data[key] != null).length;
    const totalFields = 22;
    setProgress(Math.round((completedFields / totalFields) * 100));
  };
  
  const onSubmit = async (data) => {
    try {
      const response = await fetch('/api/questionnaire/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'current-user-id', // Replace with actual auth
          responses: data,
          progress_percentage: progress
        })
      });
      
      if (response.ok) {
        console.log('Questionnaire saved successfully');
        alert('Questionnaire completed!');
      }
    } catch (error) {
      console.error('Failed to save questionnaire:', error);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span>Progress: {progress}%</span>
          <span>Step {currentStep + 1} of {STEPS.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <form onChange={() => updateProgress(watch())} onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Goals */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Your Fitness Goals</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Primary Goal</label>
              <select 
                {...register('goal_primary', { required: true })}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Select your main goal</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="performance">Performance</option>
                <option value="rehab">Rehabilitation</option>
                <option value="general_health">General Health</option>
                <option value="other">Other</option>
              </select>
              {errors.goal_primary && <span className="text-red-500 text-sm">This field is required</span>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Timeframe (weeks)</label>
              <input 
                type="number" 
                min="1" 
                max="52"
                {...register('goal_timeframe_weeks', { required: true })}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Desired Intensity (1-5)</label>
              <div className="flex space-x-2">
                {[1,2,3,4,5].map(num => (
                  <label key={num} className="flex-1 text-center">
                    <input type="radio" value={num} {...register('goal_intensity')} className="hidden peer" />
                    <div className="p-3 border rounded-lg peer-checked:bg-blue-100 peer-checked:border-blue-500 cursor-pointer">
                      {num}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Step 2: Experience */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Your Experience</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Years of Training Experience</label>
              <input 
                type="number" 
                step="0.5"
                min="0" 
                max="20"
                {...register('exp_years', { required: true })}
                className="w-full p-3 border rounded-lg"
                placeholder="e.g., 2.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Equipment Familiarity (1-5)</label>
              <div className="flex space-x-2">
                {[1,2,3,4,5].map(num => (
                  <label key={num} className="flex-1 text-center">
                    <input type="radio" value={num} {...register('exp_equipment')} className="hidden peer" />
                    <div className="p-3 border rounded-lg peer-checked:bg-blue-100 peer-checked:border-blue-500 cursor-pointer">
                      {num}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button 
            type="button"
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 0}
            className="px-6 py-2 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          
          {currentStep < STEPS.length - 1 ? (
            <button 
              type="button"
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg"
            >
              Next
            </button>
          ) : (
            <button 
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg"
            >
              Complete Questionnaire
            </button>
          )}
        </div>
      </form>
    </div>
  );
}