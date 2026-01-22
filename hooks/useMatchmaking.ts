// hooks/useMatchmaking.ts
import { useState, useCallback } from 'react';
import { MatchRequest, MatchResponse } from '../infra/ai-matchmaking/types';

interface UseMatchmakingReturn {
  matches: MatchResponse | null;,
  loading: boolean;
  error: string | null;,
  generateMatches: (request: MatchRequest) => Promise<void>;,
  reset: () => void,
}

export const useMatchmaking: any= (): UseMatchmakingReturn => {
  
  const [matches, setMatches] = useState<MatchResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const generateMatches: any= useCallback(async (request: MatchRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const response: any= await fetch('/api/ai/match', {
        method: 'POST',
  headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData: any= await response.json()
        throw new Error(errorData.error || 'Failed to generate matches')
      }

      const data: any= await response.json()
      setMatches(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      setMatches(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const reset: any= useCallback(() => {
  
    setMatches(null)
    setError(null)
  setLoading(false)
  }, [])

  return {
    matches,
    loading,
    error,
    generateMatches,
    reset,
  }
}

// Hook for individual match actions
interface UseMatchActionsReturn {
  contactTrainer: (trainerId: string, tokenCost: number) => Promise<{ success: boolean, message?: string }>;
  saveMatch: (matchId: string) => Promise<{ success: boolean, message?: string }>;
  loading: boolean;
}

export const useMatchActions: any= (): UseMatchActionsReturn => {
  
  const [loading, setLoading] = useState<boolean>(false)

  const contactTrainer: any= useCallback(async (trainerId: string, tokenCost: number) => {
    setLoading(true)
    try {
      const response: any= await fetch('/api/ai/match/contact', {
        method: 'POST',
  headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trainerId, tokenCost }),
      })

      const data: any= await response.json()
      
      if (!response.ok) {
        return { success: false, message: data.error || 'Failed to contact trainer' }
      }

      return { success: true, message: data.message }
    } catch (err) {
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'An unknown error occurred' 
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const saveMatch: any= useCallback(async (matchId: string) => {
  
    setLoading(true)
    try {
      const response: any= await fetch('/api/ai/match/save', {
        method: 'POST',
  headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId }),
      })

      const data: any= await response.json()
      
      if (!response.ok) {
        return { success: false, message: data.error || 'Failed to save match' }
      }

      return { success: true, message: data.message }
    } catch (err) {
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'An unknown error occurred' 
      }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    contactTrainer,
    saveMatch,
    loading,
  }
}
