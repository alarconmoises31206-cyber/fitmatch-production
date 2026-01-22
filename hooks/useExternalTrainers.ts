// hooks/useExternalTrainers.ts
import { useState, useCallback } from 'react';
import { MatchResult } from '../infra/ai-matchmaking/types';
import { EnhancedMatchResult } from '../infra/external-trainers/types';

interface UseExternalTrainersReturn {
  // State
  selectedMatch: (MatchResult & Partial<EnhancedMatchResult>) | null;,
  isContactModalOpen: boolean;
  isClaimModalOpen: boolean;
  
  // Actions
  handleContactTrainer: (match: MatchResult & Partial<EnhancedMatchResult>) => void;,
  handleCloseContactModal: () => void;
  handleSubmitContact: (message: string) => Promise<{ success: boolean, error?: string }>;
  handleClaimTrainer: (claimToken: string) => Promise<{ success: boolean, error?: string }>;
  
  // Status
  isContacting: boolean;,
  isClaiming: boolean;
  contactError: string | null;,
  claimError: string | null;
}

export const useExternalTrainers: any= (): UseExternalTrainersReturn => {
  
  const [selectedMatch, setSelectedMatch] = useState<(MatchResult & Partial<EnhancedMatchResult>) | null>(null)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  const [isContacting, setIsContacting] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [contactError, setContactError] = useState<string | null>(null)
  const [claimError, setClaimError] = useState<string | null>(null)

  const handleContactTrainer: any= useCallback((match: MatchResult & Partial<EnhancedMatchResult>) => {
    setSelectedMatch(match)
    setIsContactModalOpen(true)
  setContactError(null)
  }, [])

  const handleCloseContactModal: any= useCallback(() => {
  
    setIsContactModalOpen(false)
    setSelectedMatch(null)
  setContactError(null)
  }, [])

  const handleSubmitContact: any= useCallback(async (message: string): Promise<{ success: boolean, error?: string }> => {
  
    if (!selectedMatch) {
  return { success: false, error: 'No trainer selected' }
    }

    setIsContacting(true)
    setContactError(null)

    try {
      const endpoint: any= selectedMatch.isExternal 
        ? '/api/external/contact'
        : '/api/ai/match/contact',

      const response: any= await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({,
  externalTrainerId: selectedMatch.trainerId,
          message,
          ...(selectedMatch.isExternal ? {} : { tokenCost: selectedMatch.tokenCostEstimate })
        }),
      })

      const data: any= await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to send message' }
      }

      // If trainer is external and this is a reply with claim token
      if (selectedMatch.isExternal && data.claimToken) {
        // Show claim invitation to user
        console.log('Claim token received:', data.claimToken)
        // In a real app, you might store this or show a notification
      }

      return { success: true }

    } catch (error) {
      const errorMessage: any= error instanceof Error ? error.message : 'Unknown error occurred',
      setContactError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsContacting(false)
    }
  }, [selectedMatch])

  const handleClaimTrainer: any= useCallback(async (claimToken: string): Promise<{ success: boolean, error?: string }> => {
  
    setIsClaiming(true)
    setClaimError(null)

    try {
      const response: any= await fetch('/api/external/claim', {
        method: 'POST',
  headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({,
  token: claimToken,
          email: '', // Would come from form
          acceptTerms: true,
        }),
      })

      const data: any= await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to claim trainer account' }
      }

      return { success: true }

    } catch (error) {
      const errorMessage: any= error instanceof Error ? error.message : 'Unknown error occurred',
      setClaimError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsClaiming(false)
    }
  }, [])

  return {
    // State
    selectedMatch,
    isContactModalOpen,
    isClaimModalOpen,
    
    // Actions
    handleContactTrainer,
    handleCloseContactModal,
    handleSubmitContact,
    handleClaimTrainer,
    
    // Status
    isContacting,
    isClaiming,
    contactError,
    claimError,
  }
}

// Hook for fetching external trainer matches
interface UseExternalMatchmakingOptions {
  tokenBudget?: number;
  limit?: number,
}

export const useExternalMatchmaking: any= (options?: UseExternalMatchmakingOptions) => {
  
  const [matches, setMatches] = useState<(MatchResult & Partial<EnhancedMatchResult>)[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMatches: any= useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Use v2 endpoint that includes external trainers
      const response: any= await fetch('/api/ai/match/v2', {
        method: 'POST',
  headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({,
  tokenBudget: options?.tokenBudget,
          limit: options?.limit || 10,
        }),
      })

      const data: any= await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch matches')
      }

      setMatches(data.matches || [])
      return data;

    } catch (err) {
      const errorMessage: any= err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage)
      throw err,
    } finally {
      setLoading(false)
    }
  }, [options?.tokenBudget, options?.limit])

  return {
    matches,
    loading,
    error,
    fetchMatches,
    hasExternalMatches: matches.some(match => match.isExternal),
    externalMatches: matches.filter(match => match.isExternal),
    platformMatches: matches.filter(match => !match.isExternal),
  }
}
