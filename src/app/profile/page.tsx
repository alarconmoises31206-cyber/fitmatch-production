'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile, useUpdateProfile } from '@/hooks/useProfiles'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

function ProfileContent() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    goals: [] as string[],
    experience: '' as 'beginner' | 'intermediate' | 'advanced' | 'expert' | '',
    preferences: {
      trainingStyle: [] as string[],
      availability: [] as string[],
      locationPreference: ''
    }
  })

  // Get user profile
  const { data: profile, isLoading } = useProfile(user?.id || '')
  const updateProfile = useUpdateProfile()

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        goals: profile.goals || [],
        experience: profile.experience || '',
        preferences: {
          trainingStyle: profile.preferences?.trainingStyle || [],
          availability: profile.preferences?.availability || [],
          locationPreference: profile.preferences?.locationPreference || ''
        }
      })
    }
  }, [profile])

  const handleSave = async () => {
    if (!user?.id) return

    try {
      // Only send fields that have values
      const updates: any = {
        name: formData.name || undefined,
        bio: formData.bio || undefined,
        location: formData.location || undefined,
        goals: formData.goals.length > 0 ? formData.goals : undefined,
        experience: formData.experience || undefined,
        preferences: formData.preferences.locationPreference ? {
          trainingStyle: formData.preferences.trainingStyle,
          availability: formData.preferences.availability,
          locationPreference: formData.preferences.locationPreference
        } : undefined
      }

      // Remove undefined values
      Object.keys(updates).forEach(key => {
        if (updates[key] === undefined) {
          delete updates[key]
        }
      })

      await updateProfile.mutateAsync({
        id: user.id,
        updates
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleGoalToggle = (goal: string) => {
    setFormData((prev: any) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g: string) => g !== goal)
        : [...prev.goals, goal]
    }))
  }

  const calculateCompletion = () => {
    const fields = [
      formData.name,
      formData.location,
      formData.experience,
      formData.goals.length > 0
    ]
    const completed = fields.filter(Boolean).length
    return Math.round((completed / fields.length) * 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const completionPercent = calculateCompletion()

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Profile</h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-400">Complete your profile to find better matches</p>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                {completionPercent}% Complete
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateProfile.isPending}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {updateProfile.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-gray-800 rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, location: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white disabled:opacity-50"
                  placeholder="City, State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Experience Level
                </label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, experience: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white disabled:opacity-50"
                >
                  <option value="">Select experience level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            {/* Goals & Bio */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Goals & Bio</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fitness Goals
                </label>
                <div className="space-y-2">
                  {['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'].map((goal) => (
                    <label key={goal} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.goals.includes(goal)}
                        onChange={() => handleGoalToggle(goal)}
                        disabled={!isEditing}
                        className="mr-2"
                      />
                      <span className="text-white capitalize">
                        {goal.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white disabled:opacity-50"
                  placeholder="Tell others about your fitness journey..."
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {updateProfile.isError && (
            <div className="mt-4 bg-red-900/20 border border-red-700 text-red-200 p-3 rounded">
              Failed to update profile. Please try again.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}