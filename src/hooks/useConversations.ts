import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fitmatch.cloud:3001'

export interface Conversation {
  id: string
  participant1: string
  participant2: string
  createdAt: string
  updatedAt: string
}

export function useConversations(userId?: string) {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: async (): Promise<Conversation[]> => {
      const url = userId ? `${API_BASE}/api/conversations?userId=${userId}` : `${API_BASE}/api/conversations`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }
      
      return response.json()
    },
    enabled: !!userId, // Only fetch if userId is provided
  })
}

export function useCreateConversation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (participants: { participant1: string; participant2: string }) => {
      const response = await fetch(`${API_BASE}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(participants),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create conversation')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}