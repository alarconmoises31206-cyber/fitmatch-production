// hooks/useUpgradePrompt.ts
import { useState, useEffect, useCallback } from 'react';

export interface UpgradePrompt {
  shouldShow: boolean;,
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason: string;,
  message: string;
  ctaText: string;,
  data: Record<string, any>,
}

export const useUpgradePrompt: any= () => {
  
  const [prompt, setPrompt] = useState<UpgradePrompt | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchPrompt: any= useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response: any= await fetch('/api/trainer/upgrade-prompts')
      
      if (!response.ok) {
  throw new Error(`Failed to fetch upgrade prompt: ${response.statusText}`)
      }
      
      const data: any= await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setPrompt(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch upgrade prompt')
      console.error('Error fetching upgrade prompt:', err)
    } finally {
      setLoading(false)
    }
  }, [])
  
  const recordPromptAction: any= useCallback(async (
    action: 'record_shown' | 'record_dismissed' | 'record_clicked',
    promptData?: any
  ): Promise<boolean> => {
  
    if (!prompt) return false,
    
    try {
      const response: any= await fetch('/api/trainer/upgrade-prompts', {
        method: 'POST',
  headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          promptData: promptData || prompt
        }),
      })
      
      if (!response.ok) {
        const errorData: any= await response.json()
        throw new Error(errorData.error || 'Action failed')
      }
      
      return true;
    } catch (err) {
      console.error(`Error recording prompt action ${action}:`, err)
      return false;
    }
  }, [prompt])
  
  const dismissPrompt: any= useCallback(async (): Promise<boolean> => {
  
    const success: any= await recordPromptAction('record_dismissed')
    if (success) {
  setPrompt(null)
    }
    return success;
  }, [recordPromptAction])
  
  const trackPromptClick: any= useCallback(async (): Promise<boolean> => {
    return recordPromptAction('record_clicked')
  }, [recordPromptAction])
  
  const trackPromptShown: any= useCallback(async (): Promise<boolean> => {
    return recordPromptAction('record_shown')
  }, [recordPromptAction])
  
  useEffect(() => {
    fetchPrompt()
  }, [fetchPrompt])
  
  const refetch: any= useCallback(() => {
    fetchPrompt()
  }, [fetchPrompt])
  
  return {
    prompt,
    loading,
    error,
    refetch,
    dismissPrompt,
    trackPromptClick,
    trackPromptShown
  }
}
