// components/TrainerProfileEditor.tsx - MINIMAL VERSION
'use client';
import { useState, useEffect } from 'react';

interface ConfigData {
  specialties: string[];
  pricing_tiers: string[];
  days_of_week: string[];
}

interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
}

interface TrainerProfile {
  full_name: string;
  headline: string;
  bio: string;
  years_experience: number;
  pricing_tier: string;
  specialties: string[];
  availability: AvailabilitySlot[];
  socials: SocialLinks;
}

const TIME_SLOTS = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM'
];

export default function TrainerProfileEditor({ initialProfile, onSave }: { initialProfile: any, onSave: (profile: any) => void }) {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [profile, setProfile] = useState<TrainerProfile>(initialProfile || {
    full_name: '',
    headline: '',
    bio: '',
    years_experience: 0,
    pricing_tier: 'standard',
    specialties: [],
    availability: [],
    socials: {}
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Load config data
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(setConfig)
      .catch(console.error);
  }, []);

  const handleSave = () => {
    setSaving(true);
    onSave(profile);
    setSaving(false);
    setMessage('? Profile saved!');
  };

  if (!config) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Trainer Profile Editor</h1>
        <p className="text-gray-600 mt-2">Update your professional profile</p>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
            <input
              type="number"
              value={profile.years_experience}
              onChange={(e) => setProfile(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
          <input
            type="text"
            value={profile.headline}
            onChange={(e) => setProfile(prev => ({ ...prev, headline: e.target.value }))}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Specialties */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Specialties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {config.specialties.map(specialty => (
            <button
              key={specialty}
              type="button"
              onClick={() => {
                setProfile(prev => ({
                  ...prev,
                  specialties: prev.specialties.includes(specialty)
                    ? prev.specialties.filter(s => s !== specialty)
                    : [...prev.specialties, specialty]
                }));
              }}
              className={`p-4 rounded-xl border-2 ${profile.specialties.includes(specialty) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
            >
              {specialty}
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
