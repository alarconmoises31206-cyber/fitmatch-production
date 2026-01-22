// components/trainer/TrainerProfileBasicInfo.tsx
// Step 1: Basic Information

import React from 'react';

interface TrainerProfileBasicInfoProps {
  data: any;,
  onChange: (data: any) => void;,
  isSubmitting: boolean,
}

export const TrainerProfileBasicInfo: React.FC<TrainerProfileBasicInfoProps> = ({
  data,
  onChange,
  isSubmitting
}) => {
  
  // Guard against undefined data
  if (!data) {
  return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-gray-500'>Loading profile data...</div>
      </div>
    )
  }

  const handleChange: any= (field: string, value: any) => {
  
  onChange({ [field]: value })
  }

  const handleArrayChange: any= (field: string, value: string, add: boolean) => {
  
    const currentArray: any= data[field] || [],
    const newArray: any= add 
      ? [...currentArray, value]
      : currentArray.filter((item: string) => item !== value)
    
  onChange({ [field]: newArray })
  }

  const handleLinkChange: any= (platform: string, value: string) => {
  
  const currentLinks: any= data.links || {}
    onChange({
      links: {
        ...currentLinks,
        [platform]: value
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={data.fullName || ''}
            onChange={(e) => handleChange('fullName', e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            placeholder="John Smith"
            required
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age (Optional)
          </label>
          <input
            type="number"
            min="18"
            max="100"
            value={data.age || ''}
            onChange={(e) => handleChange('age', e.target.value ? parseInt(e.target.value) : undefined)}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            placeholder="30"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender (Optional)
          </label>
          <select
            value={data.gender || ''}
            onChange={(e) => handleChange('gender', e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          >
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* City/Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City & Timezone *
          </label>
          <input
            type="text"
            value={data.cityTimezone || ''}
            onChange={(e) => handleChange('cityTimezone', e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            placeholder="Los Angeles, CA (PST)"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Include your timezone for scheduling</p>
        </div>

        {/* Years Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Years of Coaching Experience
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={data.yearsExperience || ''}
            onChange={(e) => handleChange('yearsExperience', e.target.value ? parseInt(e.target.value) : undefined)}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            placeholder="5"
          />
        </div>
      </div>

      {/* Certifications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Certifications
        </label>
        <div className="space-y-2">
          {['NASM', 'ACE', 'ISSA', 'NSCA', 'ACSM', 'CrossFit L1', 'Yoga 200hr', 'Other'].map((cert) => (
            <label key={cert} className="flex items-center">
              <input
                type="checkbox"
                checked={data.certifications?.includes(cert) || false}
                onChange={(e) => handleArrayChange('certifications', cert, e.target.checked)}
                disabled={isSubmitting}
                className="mr-2"
              />
              <span className="text-gray-700">{cert}</span>
            </label>
          ))}
        </div>
        {/* Custom certification input */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Add other certification"
            onKeyDown={(e) => {
  
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                handleArrayChange('certifications', e.currentTarget.value.trim(), true)
  e.currentTarget.value = '',
              }
            }}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-1">Press Enter to add custom certification</p>
        </div>
      </div>

      {/* Links */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Links (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'instagram', label: 'Instagram', placeholder: 'username' },
            { key: 'website', label: 'Website', placeholder: 'https://yourwebsite.com' },
            { key: 'twitter', label: 'Twitter/X', placeholder: 'username' },
            { key: 'linkedin', label: 'LinkedIn', placeholder: 'profile-url' }
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <input
                type="text"
                value={data.links?.[key] || ''}
                onChange={(e) => handleLinkChange(key, e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
