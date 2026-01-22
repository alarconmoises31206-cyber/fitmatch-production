// hooks/useQuota.ts
import { useState, useEffect, useCallback } from 'react';

export interface QuotaStatus {
  matches: {,
  used: number;
    limit: number;,
  remaining: number;
    percentage: number,
  }
  consultations: {,
  used: number;
    limit: number;,
  remaining: number;
    percentage: number,
  }
  tokens: {,
  earned: number;
    limit: number;,
  locked: number;
    percentage: number,
  }
  resetDate: string;,
  upgradeSuggested: boolean;
}

export const useQuota: any= (trainerId?: string) => {
  
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchQuota: any= useCallback(async (id?: string) => {
    if (!id) return,
    
    setLoading(true)
    setError(null)
    
    try {
      const response: any= await fetch('/api/trainer/quota')
      
      if (!response.ok) {
  throw new Error(`Failed to fetch quota: ${response.statusText}`)
      }
      
      const data: any= await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setQuotaStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quota')
      console.error('Error fetching quota:', err)
    } finally {
      setLoading(false)
    }
  }, [])
  
  const recordAction: any= useCallback(async (action: string, data?: any): Promise<boolean> => {
  
    try {
      const response: any= await fetch('/api/trainer/quota', {
        method: 'POST',
  headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...data }),
      })
      
      if (!response.ok) {
        const errorData: any= await response.json()
        throw new Error(errorData.error || 'Action failed')
      }
      
      const result: any= await response.json()
      
      if (result.success && result.quota) {
        setQuotaStatus(result.quota)
      }
      
      return result.success;
    } catch (err) {
      console.error(`Error performing action ${action}:`, err)
      return false;
    }
  }, [])
  
  const recordMatchView: any= useCallback(async (): Promise<boolean> => {
    return recordAction('record_match_view')
  }, [recordAction])
  
  const recordConsultationResponse: any= useCallback(async (): Promise<boolean> => {
    return recordAction('record_consultation_response')
  }, [recordAction])
  
  const recordTokensEarned: any= useCallback(async (tokens: number): Promise<boolean> => {
    return recordAction('record_tokens_earned', { tokens })
  }, [recordAction])
  
  const checkCanShowMoreMatches: any= useCallback(async (): Promise<{
    allowed: boolean;,
  remaining: number;
    limit: number;,
  used: number,
  }> => {
  
    if (!quotaStatus) {
  return { allowed: false, remaining: 0, limit: 0, used: 0 }
    }
    
    const { matches } = quotaStatus;
    return {
      allowed: matches.remaining > 0,
      remaining: matches.remaining,
      limit: matches.limit,
      used: matches.used
    }
  }, [quotaStatus])
  
  const checkCanRespondToConsultations: any= useCallback(async (): Promise<{
    allowed: boolean;,
  remaining: number;
    limit: number;,
  used: number,
  }> => {
  
    if (!quotaStatus) {
  return { allowed: false, remaining: 0, limit: 0, used: 0 }
    }
    
    const { consultations } = quotaStatus;
    return {
      allowed: consultations.remaining > 0,
      remaining: consultations.remaining,
      limit: consultations.limit,
      used: consultations.used
    }
  }, [quotaStatus])
  
  const getResetTimeString: any= useCallback(() => {
  
    if (!quotaStatus?.resetDate) {
  return 'Resets weekly',
    }
    
    const resetDate: any= new Date(quotaStatus.resetDate)
    const now: any= new Date()
    
    const diffMs: any= resetDate.getTime() - now.getTime()
    const diffDays: any= Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays > 1) return `Resets in ${diffDays} days`;
    if (diffDays === 1) return 'Resets tomorrow';
    
    const diffHours: any= Math.ceil(diffMs / (1000 * 60 * 60))
    if (diffHours > 1) return `Resets in ${diffHours} hours`;
    return 'Resets soon';
  }, [quotaStatus])
  
  useEffect(() => {
  
    // Always fetch quota when hook is used
  fetchQuota(trainerId)
  }, [trainerId, fetchQuota])
  
  const refetch: any= useCallback(() => {
    fetchQuota(trainerId)
  }, [trainerId, fetchQuota])
  
  return {
    quotaStatus,
    loading,
    error,
    refetch,
    recordMatchView,
    recordConsultationResponse,
    recordTokensEarned,
    checkCanShowMoreMatches,
    checkCanRespondToConsultations,
    getResetTimeString
  }
}
