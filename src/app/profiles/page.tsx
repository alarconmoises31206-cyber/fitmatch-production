'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useProfiles } from '@/hooks/useProfiles'

export default function ProfilesPage() {
  const [filters, setFilters] = useState({
    location: '',
    goals: '',
    experience: ''
  })
  
  const { data: profiles, isLoading, error } = useProfiles(filters)

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-700 text-red-200 p-4 rounded">
            Error loading profiles: {error.message}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Find Fitness Partners</h1>
          <p className="text-gray-400">Connect with people who share your fitness goals</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="City or area"
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fitness Goals
              </label>
              <select
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.goals}
                onChange={(e) => handleFilterChange('goals', e.target.value)}
              >
                <option value="">All Goals</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="endurance">Endurance</option>
                <option value="flexibility">Flexibility</option>
                <option value="general_fitness">General Fitness</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Experience Level
              </label>
              <select
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.experience}
                onChange={(e) => handleFilterChange('experience', e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
        </div>

        {/* Profiles Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles?.map((profile) => (
              <Link
                key={profile.id}
                href={`/profiles/${profile.id}`}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-200 block"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {profile.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{profile.name}</h3>
                    <p className="text-gray-400 text-sm">{profile.location || 'Location not set'}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {profile.experience && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Experience:</span>
                      <span className="text-white capitalize">{profile.experience}</span>
                    </div>
                  )}
                  
                  {profile.goals && profile.goals.length > 0 && (
                    <div>
                      <span className="text-gray-400 text-sm">Goals: </span>
                      <span className="text-white text-sm">
                        {profile.goals.slice(0, 2).join(', ')}
                        {profile.goals.length > 2 && '...'}
                      </span>
                    </div>
                  )}
                  
                  {profile.bio && (
                    <p className="text-gray-300 text-sm line-clamp-2">{profile.bio}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!profiles || profiles.length === 0) && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No profiles found</div>
            <p className="text-gray-500 mt-2">Try adjusting your filters or check back later</p>
          </div>
        )}
      </div>
    </div>
  )
}