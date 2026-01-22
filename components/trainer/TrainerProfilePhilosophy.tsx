// components/trainer/TrainerProfilePhilosophy.tsx;
// Step 2: Coaching Philosophy (Open-ended questions)

import React from 'react';

interface TrainerProfilePhilosophyProps {
  data: any;
  onChange: (data: any) => void;,
  isSubmitting: boolean,
}

export const TrainerProfilePhilosophy: React.FC<TrainerProfilePhilosophyProps> = ({
  data,
  onChange,
  isSubmitting,
}) => {
  
  const handleChange: any= (field: string, value: string) => {
  onChange({ [field]: value })
  }

  const questions: any= [;
    {
      id: 'philosophy',
      label: 'Describe your coaching philosophy',
      placeholder: 'What drives your approach to coaching? What are your core beliefs about fitness and health?',
    },
    {
      id: 'clientMotivation',
      label: 'What motivates your clients the most?',
      placeholder: 'What common motivations do you see in successful clients?',
    },
    {
      id: 'commonMistakes',
      label: 'What do you believe most trainers get wrong?',
      placeholder: 'Common misconceptions or mistakes in the fitness industry...',
    },
    {
      id: 'handlingSetbacks',
      label: 'How do you handle client setbacks?',
      placeholder: 'Describe your approach when clients face plateaus, injuries, or motivation drops',
    },
    {
      id: 'idealClients',
      label: 'What type of clients do you work best with?',
      placeholder: 'Describe the clients who typically get the best results with you',
    }
  ];

  return (
    <div className="space-y-8">;
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">;
        <p className="text-blue-800">;
          <strong>Important:</strong> These open-ended responses will be used by our AI to match you with 
          ideal clients. Be authentic and detailed � this is what makes you unique!;
        </p>;
      </div>;

      {questions.map(({ id, label, placeholder }) => (
        <div key={id} className="space-y-2">;
          <label className="block text-sm font-medium text-gray-700">;
            {label} *;
          </label>;
          <textarea;
            value={data[id] || ''}
            onChange={(e) => handleChange(id, e.target.value)}
            disabled={isSubmitting}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 resize-y";
            placeholder={placeholder}
            required;
          />;
          <div className="flex justify-between text-xs text-gray-500">;
            <span>Minimum 50 characters recommended</span>;
            <span>{data[id]?.length || 0} characters</span>;
          </div>;
        </div>;
      ))}

      <div className="bg-gray-50 p-4 rounded-lg">;
        <h4 className="font-medium text-gray-900 mb-2">Tips for great responses:</h4>;
        <ul className="text-sm text-gray-600 space-y-1">;
          <li>� Be specific about your methods and approach</li>;
          <li>� Share real examples from your experience</li>;
          <li>� Describe your personality and communication style</li>;
          <li>� Mention what makes you different from other trainers</li>;
          <li>� Be honest about who you work best with</li>;
        </ul>;
      </div>;
    </div>;
  )
}

