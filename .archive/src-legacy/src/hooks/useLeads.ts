import { useQuery } from '@tanstack/react-query'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fitmatch.cloud:3001'

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  status: 'new' | 'contacted' | 'qualified' | 'converted'
  source: string
  createdAt: string
  updatedAt: string
}

export function useLeads(filters?: { status?: string; source?: string }) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: async (): Promise<Lead[]> => {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.source) params.append('source', filters.source)
      
      const url = `${API_BASE}/api/leads${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch leads')
      }
      
      return response.json()
    }})
}

export function useLead(leadId: string) {
  return useQuery({
    queryKey: ['lead', leadId],
    queryFn: async (): Promise<Lead> => {
      const response = await fetch(`${API_BASE}/api/leads/${leadId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch lead')
      }
      
      return response.json()
    },
    enabled: !!leadId})
}