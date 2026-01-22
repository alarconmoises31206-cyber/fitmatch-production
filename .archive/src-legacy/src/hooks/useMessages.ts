import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fitmatch.cloud:3001'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  timestamp: string
  read: boolean
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async (): Promise<Message[]> => {
      const response = await fetch(`${API_BASE}/api/conversations/${conversationId}/messages`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }
      
      return response.json()
    },
    enabled: !!conversationId,
    refetchInterval: 30000, // Poll every 30 seconds for new messages
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (message: { conversationId: string; senderId: string; content: string }) => {
      const response = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'},
        body: JSON.stringify(message)})
      
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      
      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] })
    }})
}