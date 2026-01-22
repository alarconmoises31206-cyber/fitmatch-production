// components/trainer/TrainerProfileDemographics.tsx;
// Step 4: Demographics & Lived Experience;

import React from 'react';

interface TrainerProfileDemographicsProps {
  data: any;
  onChange: (data: any) => void;,
  isSubmitting: boolean,
}

export const TrainerProfileDemographics: React.FC<TrainerProfileDemographicsProps> = ({
  data,
  onChange,
  isSubmitting,
}) => {
  
  const handleChange: any= (field: string, value: string) => {
  onChange({ [field]: value })
  }

  const experienceLevels: any= [;
    { value: 'very-comfortable', label: 'Very comfortable - Extensive experience' },
    { value: 'comfortable', label: 'Comfortable - Some experience' },
    { value: 'learning', label: 'Still learning - Open to working with' },
    { value: 'not-comfortable', label: 'Not comfortable at this time' }
  ];

  return (
    <div className="space-y-8">;
      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">;
        <p className="text-purple-800">;
          <strong>Note:</strong> This section is optional but helps us create more meaningful matches. 
          Your lived experience can be a powerful connection point with clients.;
        </p>;
      </div>;

      {/* Comfort with Beginners */}
      <div>;
        <label className="block text-sm font-medium text-gray-700 mb-3">;
          How comfortable are you working with complete beginners?;
        </label>;
        <div className="space-y-2">;
          {experienceLevels.map(({ value, label }) => (
            <label key={value} className="flex items-center">;
              <input;
                type="radio";
                name="comfortWithBeginners";
                value={value}
                checked={data.comfortWithBeginners === value}
                onChange={(e) => handleChange('comfortWithBeginners', e.target.value)}
                disabled={isSubmitting}
                className="mr-3";
              />;
              <span className="text-gray-700">{label}</span>;
            </label>;
          ))}
        </div>;
      </div>;

      {/* Comfort with Neurodivergent Clients */}
      <div>;
        <label className="block text-sm font-medium text-gray-700 mb-3">;
          How comfortable are you working with neurodivergent clients (ADHD, Autism, etc.)?;
        </label>;
        <div className="space-y-2">;
          {experienceLevels.map(({ value, label }) => (
            <label key={value} className="flex items-center">;
              <input;
                type="radio";
                name="comfortWithNeurodivergent";
                value={value}
                checked={data.comfortWithNeurodivergent === value}
                onChange={(e) => handleChange('comfortWithNeurodivergent', e.target.value)}
                disabled={isSubmitting}
                className="mr-3";
              />;
              <span className="text-gray-700">{label}</span>;
            </label>;
          ))}
        </div>;
      </div>;

      {/* Trauma-Sensitive Experience */}
      <div>;
        <label className="block text-sm font-medium text-gray-700 mb-2">;
          Trauma-Sensitive Experience (Optional)
        </label>;
        <textarea;
          value={data.traumaSensitiveExperience || ''}
          onChange={(e) => handleChange('traumaSensitiveExperience', e.target.value)}
          disabled={isSubmitting}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50";
          placeholder="Describe any training or experience you have with trauma-informed approaches...";
        />;
      </div>;

      {/* Cultural Experience */}
      <div>;
        <label className="block text-sm font-medium text-gray-700 mb-2">;
          Cultural Experience & Background (Optional)
        </label>;
        <textarea;
          value={data.culturalExperience || ''}
          onChange={(e) => handleChange('culturalExperience', e.target.value)}
          disabled={isSubmitting}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50";
          placeholder="Share any cultural competencies, language skills, or lived experiences that inform your coaching...";
        />;
      </div>;

      {/* Language Preferences */}
      <div>;
        <label className="block text-sm font-medium text-gray-700 mb-2">;
          Language Preferences (Optional)
        </label>;
        <input;
          type="text";
          value={data.languagePreferences || ''}
          onChange={(e) => handleChange('languagePreferences', e.target.value)}
          disabled={isSubmitting}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50";
          placeholder="e.g., Fluent in Spanish, Basic ASL, etc.";
        />;
      </div>;

      <div className="bg-gray-50 p-4 rounded-lg">;
        <h4 className="font-medium text-gray-900 mb-2">Why this matters:</h4>;
        <ul className="text-sm text-gray-600 space-y-1">;
          <li>� Clients often seek trainers who understand their specific background or challenges</li>;
          <li>� Your lived experience can create deeper client-trainer connections</li>;
          <li>� Being honest about your comfort levels leads to better matches</li>;
          <li>� This information is never used for discrimination - only for better matching</li>;
        </ul>;
      </div>;
    </div>;
  )
}

