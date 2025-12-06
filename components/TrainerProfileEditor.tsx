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

export default function TrainerProfileEditor() {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [profile, setProfile] = useState<TrainerProfile>({
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

  const handleSpecialtyToggle = (specialty: string) => {
    setProfile(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleAvailabilityToggle = (dayIndex: number, startTime: string, endTime: string) => {
    setProfile(prev => {
      const existingSlotIndex = prev.availability.findIndex(
        slot => slot.day_of_week === dayIndex
      );

      if (existingSlotIndex > -1) {
        // Remove existing slot
        return {
          ...prev,
          availability: prev.availability.filter((_, index) => index !== existingSlotIndex)
        };
      } else {
        // Add new slot
        return {
          ...prev,
          availability: [
            ...prev.availability,
            { day_of_week: dayIndex, start_time: startTime, end_time: endTime }
          ]
        };
      }
    });
  };

  const handleSocialUpdate = (platform: keyof SocialLinks, value: string) => {
    setProfile(prev => ({
      ...prev,
      socials: {
        ...prev.socials,
        [platform]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/trainers/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      const result = await response.json();

      if (result.success) {
        setMessage('✅ Profile saved successfully!');
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return <div className="p-8 text-center">Loading editor...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Trainer Profile Editor</h1>
        <p className="text-gray-600 mt-2">Update your professional profile</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience *
            </label>
            <input
              type="number"
              min="0"
              max="40"
              value={profile.years_experience}
              onChange={(e) => setProfile(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Headline *
          </label>
          <input
            type="text"
            value={profile.headline}
            onChange={(e) => setProfile(prev => ({ ...prev, headline: e.target.value }))}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Strength Coach • Hypertrophy Specialist"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio *
          </label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tell your story, philosophy, and approach to training..."
          />
        </div>
      </div>

      {/* Specialties Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Specialties *</h2>
        <p className="text-gray-600 mb-4">Select your areas of expertise</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {config.specialties.map(specialty => (
            <button
              key={specialty}
              type="button"
              onClick={() => handleSpecialtyToggle(specialty)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 font-medium ${
                profile.specialties.includes(specialty)
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {specialty} {profile.specialties.includes(specialty) ? '✓' : ''}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Selected: <span className="font-semibold text-blue-600">{profile.specialties.length}</span> specialties
        </p>
      </div>

      {/* Availability Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Weekly Availability</h2>
        <p className="text-gray-600 mb-6">Set your available hours for client sessions</p>
        
        <div className="space-y-4">
          {config.days_of_week.map((day, dayIndex) => {
            const dayAvailability = profile.availability.find(slot => slot.day_of_week === dayIndex);
            const isAvailable = !!dayAvailability;
            
            return (
              <div key={day} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-900 min-w-24">{day}</span>
                  
                  {isAvailable ? (
                    <div className="flex items-center space-x-2">
                      <select 
                        value={dayAvailability.start_time}
                        onChange={(e) => {
                          const newAvailability = profile.availability.map(slot =>
                            slot.day_of_week === dayIndex 
                              ? { ...slot, start_time: e.target.value }
                              : slot
                          );
                          setProfile(prev => ({ ...prev, availability: newAvailability }));
                        }}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      >
                        {TIME_SLOTS.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <span className="text-gray-500">to</span>
                      <select 
                        value={dayAvailability.end_time}
                        onChange={(e) => {
                          const newAvailability = profile.availability.map(slot =>
                            slot.day_of_week === dayIndex 
                              ? { ...slot, end_time: e.target.value }
                              : slot
                          );
                          setProfile(prev => ({ ...prev, availability: newAvailability }));
                        }}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      >
                        {TIME_SLOTS.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">Not available</span>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => handleAvailabilityToggle(dayIndex, '9:00 AM', '5:00 PM')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isAvailable
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {isAvailable ? 'Remove' : 'Add'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Social Links</h2>
        <p className="text-gray-600 mb-4">Connect your social media profiles</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram
            </label>
            <input
              type="text"
              value={profile.socials.instagram || ''}
              onChange={(e) => handleSocialUpdate('instagram', e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="@username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TikTok
            </label>
            <input
              type="text"
              value={profile.socials.tiktok || ''}
              onChange={(e) => handleSocialUpdate('tiktok', e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="@username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube
            </label>
            <input
              type="text"
              value={profile.socials.youtube || ''}
              onChange={(e) => handleSocialUpdate('youtube', e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Channel URL"
            />
          </div>
        </div>
      </div>

      {/* Pricing Tier */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Pricing Tier</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {config.pricing_tiers.map(tier => (
            <button
              key={tier}
              type="button"
              onClick={() => setProfile(prev => ({ ...prev, pricing_tier: tier }))}
              className={`p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                profile.pricing_tier === tier
                  ? 'border-blue-600 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-semibold capitalize text-gray-900">
                {tier} {profile.pricing_tier === tier ? '✓' : ''}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {tier === 'budget' && 'Affordable coaching for beginners'}
                {tier === 'standard' && 'Professional coaching with balanced pricing'}
                {tier === 'premium' && 'Elite coaching with premium features'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="text-center">
        <button
          onClick={handleSave}
          disabled={saving || !profile.full_name || !profile.headline || !profile.bio || profile.specialties.length === 0}
          className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}