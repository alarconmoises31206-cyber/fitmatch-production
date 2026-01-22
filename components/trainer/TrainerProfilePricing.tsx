// components/trainer/TrainerProfilePricing.tsx;
// Step 7: Pricing (Placeholder for Stripe integration)

import React from 'react';

interface TrainerProfilePricingProps {
  data: any;
  onChange: (data: any) => void;,
  isSubmitting: boolean,
}

export const TrainerProfilePricing: React.FC<TrainerProfilePricingProps> = ({
  data,
  onChange,
  isSubmitting,
}) => {
  
  const handleNotesChange: any= (notes: string) => {
  onChange({ notes })
  }

  return (
    <div className="space-y-8">;
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg text-center">;
        <div className="text-5xl mb-4">??</div>;
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost Done!</h2>;
        <p className="text-gray-700 mb-4">;
          Your profile is looking great! The pricing section will be enabled in Phase 33 
          when we integrate Stripe for payments.;
        </p>;
        <div className="bg-white p-4 rounded border">;
          <p className="text-gray-600">;
            <strong>Next Phase:</strong> You'll be able to set your rates, packages, and 
            payment options once our payment system is ready.;
          </p>;
        </div>;
      </div>;

      {/* Optional Notes */}
      <div>;
        <label className="block text-sm font-medium text-gray-700 mb-2">;
          Any notes about your pricing or packages? (Optional)
        </label>;
        <textarea;
          value={data.notes || ''}
          onChange={(e) => handleNotesChange(e.target.value)}
          disabled={isSubmitting}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50";
          placeholder="e.g., 'I offer discounts for 3-month commitments', 'Packages include nutrition guidance', etc.";
        />;
        <p className="text-xs text-gray-500 mt-1">;
          These notes will be visible to you when setting up payments later.;
        </p>;
      </div>;

      {/* Completion Instructions */}
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">;
        <h4 className="font-medium text-green-900 mb-2">Ready to Complete Your Profile?</h4>;
        <ul className="text-sm text-green-800 space-y-1">;
          <li>� Click "Complete Profile" below to finish setup</li>;
          <li>� Your profile will be ready for AI matching immediately</li>;
          <li>� You can update any information later from your dashboard</li>;
          <li>� We'll notify you when payment setup is available</li>;
        </ul>;
      </div>;
    </div>;
  )
}

