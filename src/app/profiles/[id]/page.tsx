'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useProfile } from '@/hooks/useProfiles'

export default function ProfileDetailPage() {
  const params = useParams()
  const profileId = params.id as string
  const { data: profile, isLoading, error } = useProfile(profileId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/20 border border-red-700 text-red-200 p-4 rounded">
            {error ? `Error loading profile: ${error.message}` : 'Profile not found'}
          </div>
          <Link
            href="/profiles"
            className="inline-block mt-4 text-indigo-400 hover:text-indigo-300"
          >
            ← Back to profiles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link
          href="/profiles"
          className="inline-flex items-center text-indigo-400 hover:text-indigo-300 mb-6"
        >
          ← Back to profiles
        </Link>

        {/* Profile Header */}
        <div className="bg-gray-800 rounded-lg p-8 mb-6">
          <div className="flex items-start space-x-6">
            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
              {profile.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{profile.name}</h1>
              <div className="flex flex-wrap gap-4 text-gray-300 mb-4">
                {profile.location && (
                  <span className="flex items-center">
                    📍 {profile.location}
                  </span>
                )}
                {profile.experience && (
                  <span className="flex items-center">
                    💪 {profile.experience.charAt(0).toUpperCase() + profile.experience.slice(1)}
                  </span>
                )}
              </div>
              {profile.bio && (
                <p className="text-gray-300 text-lg">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Goals */}
          {profile.goals && profile.goals.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Fitness Goals</h2>
              <div className="flex flex-wrap gap-2">
                {profile.goals?.map((goal: string, index: number) => (
                  <span
                    key={index}
                    className="bg-indigo-900/50 text-indigo-200 px-3 py-1 rounded-full text-sm"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Preferences */}
          {profile.preferences && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Preferences</h2>
              <div className="space-y-3">
                {profile.preferences.trainingStyle && profile.preferences.trainingStyle.length > 0 && (
                  <div>
                    <span className="text-gray-400">Training Styles: </span>
                    <span className="text-white">
                      {profile.preferences.trainingStyle.join(', ')}
                    </span>
                  </div>
                )}
                {profile.preferences.availability && profile.preferences.availability.length > 0 && (
                  <div>
                    <span className="text-gray-400">Availability: </span>
                    <span className="text-white">
                      {profile.preferences.availability.join(', ')}
                    </span>
                  </div>
                )}
                {profile.preferences.locationPreference && (
                  <div>
                    <span className="text-gray-400">Location Preference: </span>
                    <span className="text-white">{profile.preferences.locationPreference}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
            Send Message
          </button>
          <button className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold">
            Connect
          </button>
        </div>
      </div>
    </div>
  )
}