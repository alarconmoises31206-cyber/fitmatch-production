import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fitmatch.cloud:3001'

export interface Profile {
  id: string
  userId: string
  name: string
  email: string
  avatar?: string
  bio?: string
  location?: string
  goals?: string[]
  experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  preferences?: {
    trainingStyle?: string[]
    availability?: string[]
    locationPreference?: string
  }
  createdAt: string
  updatedAt: string
}

// Mock data for development while backend is being set up
const mockProfiles: Profile[] = [
  {
    id: '1',
    userId: 'user1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    bio: 'Fitness enthusiast looking for workout partners. Love running and weight training.',
    location: 'New York, NY',
    goals: ['weight_loss', 'endurance'],
    experience: 'intermediate',
    preferences: {
      trainingStyle: ['strength', 'cardio'],
      availability: ['weekends', 'evenings'],
      locationPreference: 'gym'
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2', 
    userId: 'user2',
    name: 'Sarah Miller',
    email: 'sarah@example.com',
    bio: 'Yoga instructor and marathon runner. Looking for accountability partners.',
    location: 'Los Angeles, CA',
    goals: ['flexibility', 'endurance'],
    experience: 'expert',
    preferences: {
      trainingStyle: ['yoga', 'running'],
      availability: ['mornings', 'weekdays'],
      locationPreference: 'outdoor'
    },
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z'
  },
  {
    id: '3',
    userId: 'user3',
    name: 'Mike Chen',
    email: 'mike@example.com',
    bio: 'Just starting my fitness journey. Looking for a beginner-friendly workout buddy.',
    location: 'Chicago, IL',
    goals: ['general_fitness'],
    experience: 'beginner',
    preferences: {
      trainingStyle: ['bodyweight', 'cardio'],
      availability: ['evenings'],
      locationPreference: 'home'
    },
    createdAt: '2024-01-13T10:00:00Z',
    updatedAt: '2024-01-13T10:00:00Z'
  }
]

interface ProfileFilters {
  location?: string
  goals?: string
  experience?: string
}

export function useProfiles(filters?: ProfileFilters) {
  return useQuery({
    queryKey: ['profiles', filters],
    queryFn: async (): Promise<Profile[]> => {
      try {
        const params = new URLSearchParams()
        if (filters?.location) params.append('location', filters.location)
        if (filters?.goals) params.append('goals', filters.goals)
        if (filters?.experience) params.append('experience', filters.experience)
        
        const url = `${API_BASE}/api/profiles${params.toString() ? `?${params.toString()}` : ''}`
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Failed to fetch profiles')
        }
        
        return response.json()
      } catch (error) {
        console.warn('API unavailable, using mock data:', error)
        // Fallback to mock data for development
        let filteredProfiles = mockProfiles
        
        if (filters?.location) {
          filteredProfiles = filteredProfiles.filter(profile => 
            profile.location?.toLowerCase().includes(filters.location!.toLowerCase())
          )
        }
        
        if (filters?.experience) {
          filteredProfiles = filteredProfiles.filter(profile => 
            profile.experience === filters.experience
          )
        }
        
        return filteredProfiles
      }
    }})
}

export function useProfile(profileId: string) {
  return useQuery({
    queryKey: ['profile', profileId],
    queryFn: async (): Promise<Profile> => {
      try {
        const response = await fetch(`${API_BASE}/api/profiles/${profileId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }
        
        return response.json()
      } catch (error) {
        console.warn('API unavailable, using mock data:', error)
        // Fallback to mock data
        const mockProfile = mockProfiles.find(p => p.id === profileId)
        if (!mockProfile) {
          throw new Error('Profile not found')
        }
        return mockProfile
      }
    },
    enabled: !!profileId})
}

interface UpdateProfileVariables {
  id: string
  updates: Partial<Profile>
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }: UpdateProfileVariables): Promise<Profile> => {
      try {
        const response = await fetch(`${API_BASE}/api/profiles/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'},
          body: JSON.stringify(updates)})
        
        if (!response.ok) {
          throw new Error('Failed to update profile')
        }
        
        return response.json()
      } catch (error) {
        console.warn('API unavailable, simulating update:', error)
        // Simulate successful update for development
        const mockProfile = mockProfiles.find(p => p.id === id)
        if (!mockProfile) {
          throw new Error('Profile not found')
        }
        return { ...mockProfile, ...updates, id }
      }
    },
    onSuccess: (data: Profile, variables: UpdateProfileVariables) => {
      queryClient.invalidateQueries({ queryKey: ['profile', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
    }})
}