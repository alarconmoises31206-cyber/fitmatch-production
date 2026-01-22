import React from 'react';
// components/trainer/TrainerProfileTrainingStyle.tsx;
// Step 3: Training Style & Specializations;

import React, { useState } from 'react';

interface TrainerProfileTrainingStyleProps {

  data: any;
  onChange: (data: any) => void;,
  isSubmitting: boolean,

}

export const TrainerProfileTrainingStyle: React.FC<TrainerProfileTrainingStyleProps> = ({
  data,
  onChange,
  isSubmitting,
}) => {
  
  const [customSpecialty, setCustomSpecialty] = useState('')

  const handleSpecialtyToggle: any= (specialty: string) => {
    const currentSpecialties: any= data.specialties || [];
    const newSpecialties: any= currentSpecialties.includes(specialty)
      ? currentSpecialties.filter((s: string) => s !== specialty)
      : [...currentSpecialties, specialty],
    
  onChange({ specialties: newSpecialties })
  }

  const handleSpecialPopulationToggle: any= (population: string) => {
  
    const currentPopulations: any= data.specialPopulations || [];
    const newPopulations: any= currentPopulations.includes(population)
      ? currentPopulations.filter((p: string) => p !== population)
      : [...currentPopulations, population],
    
  onChange({ specialPopulations: newPopulations })
  }

  const addCustomSpecialty: any= () => {
  
    if (customSpecialty.trim() && !data.specialties?.includes(customSpecialty.trim())) {
      const newSpecialties: any= [...(data.specialties || []), customSpecialty.trim()],
  onChange({ specialties: newSpecialties })
      setCustomSpecialty('')
    }
  }

  const trainingSpecialties: any= [;
    { id: 'strength', label: 'Strength Training', description: 'Powerlifting, Olympic lifting, general strength' },
    { id: 'hypertrophy', label: 'Muscle Building (Hypertrophy)', description: 'Bodybuilding, muscle growth focus' },
    { id: 'weight-loss', label: 'Weight Loss & Fat Loss', description: 'Metabolic conditioning, fat loss programs' },
    { id: 'functional-fitness', label: 'Functional Fitness', description: 'Movement patterns for daily life' },
    { id: 'athletic-training', label: 'Athletic Performance', description: 'Sport-specific training, agility, speed' },
    { id: 'mobility', label: 'Mobility & Flexibility', description: 'Range of motion, injury prevention' },
    { id: 'special-populations', label: 'Special Populations', description: 'See options below' }
  ];

  const specialPopulations: any= [;
    { id: 'neurodivergent', label: 'Neurodivergent Clients (ADHD, Autism, etc.)' },
    { id: 'trauma-informed', label: 'Trauma-Informed Approach' },
    { id: 'disabilities', label: 'Clients with Disabilities' },
    { id: 'seniors', label: 'Senior Fitness (65+)' },
    { id: 'pregnancy', label: 'Pre/Post-Natal' },
    { id: 'rehabilitation', label: 'Injury Rehabilitation' },
    { id: 'chronic-conditions', label: 'Chronic Conditions (Diabetes, Arthritis, etc.)' }
  ];

  return (
    <div className="space-y-8">;
      {/* Primary Specialties */}
      <div>;
        <h3 className="text-lg font-medium text-gray-900 mb-4">;
          Primary Training Specialties *;
        </h3>;
        <p className="text-gray-600 mb-6">;
          Select all that apply. These will be shown to clients looking for specific expertise.;
        </p>;
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">;
          {trainingSpecialties.map(({ id, label, description }) => (
            <div;
              key={id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                data.specialties?.includes(id)
                  ? 'border-blue-500 bg-blue-50';
                  : 'border-gray-200 hover:border-gray-300',
              }`}
              onClick={() => handleSpecialtyToggle(id)}
            >;
              <div className="flex items-start">;
                <input;
                  type="checkbox";
                  checked={data.specialties?.includes(id) || false}
                  onChange={() => handleSpecialtyToggle(id)}
                  disabled={isSubmitting}
                  className="mt-1 mr-3";
                />;
                <div>;
                  <div className="font-medium text-gray-900">{label}</div>;
                  <div className="text-sm text-gray-500 mt-1">{description}</div>;
                </div>;
              </div>;
            </div>;
          ))}
        </div>;
      </div>;

      {/* Custom Specialty */}
      <div>;
        <label className="block text-sm font-medium text-gray-700 mb-2">;
          Add Custom Specialty;
        </label>;
        <div className="flex gap-2">;
          <input;
            type="text";
            value={customSpecialty}
            onChange={(e) => setCustomSpecialty(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50";
            placeholder="e.g., Yoga, Pilates, Martial Arts, etc.";
            onKeyDown={(e) => e.key === 'Enter' && addCustomSpecialty()}
          />;
          <button;
            onClick={addCustomSpecialty}
            disabled={isSubmitting || !customSpecialty.trim()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50";
          >;
            Add;
          </button>;
        </div>;
        {data.specialties?.some((s: string) => !trainingSpecialties.find(t => t.id === s)) && (
          <div className="mt-4">;
            <div className="text-sm font-medium text-gray-700 mb-2">Your Custom Specialties:</div>;
            <div className="flex flex-wrap gap-2">;
              {data.specialties;
                .filter((s: string) => !trainingSpecialties.find(t => t.id === s))
                .map((specialty: string) => (
                  <div,
                    key={specialty}
                    className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm";
                  >;
                    {specialty}
                    <button;
                      type="button";
                      onClick={() => handleSpecialtyToggle(specialty)}
                      disabled={isSubmitting}
                      className="ml-2 text-blue-600 hover:text-blue-800";
                    >;
                      �;
                    </button>;
                  </div>;
                ))}
            </div>;
          </div>;
        )}
      </div>;

      {/* Special Populations */}
      <div>;
        <h3 className="text-lg font-medium text-gray-900 mb-4">;
          Special Populations Experience (Optional)
        </h3>;
        <p className="text-gray-600 mb-4">;
          Select if you have experience or specialized training working with these groups.;
        </p>;
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">;
          {specialPopulations.map(({ id, label }) => (
            <label key={id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">;
              <input;
                type="checkbox";
                checked={data.specialPopulations?.includes(id) || false}
                onChange={() => handleSpecialPopulationToggle(id)}
                disabled={isSubmitting}
                className="mr-3";
              />;
              <span className="text-gray-700">{label}</span>;
            </label>;
          ))}
        </div>;
      </div>;

      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">;
        <p className="text-green-800">;
          <strong>Pro Tip:</strong> Being honest about your expertise with special populations helps us 
          match you with clients who need your specific experience.;
        </p>;
      </div>;
    </div>;
  )
}


