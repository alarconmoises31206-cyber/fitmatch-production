import { createInvite, validateInviteToken, markInviteUsed } from '../../../infra/invites/persistence';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js')
const mockedSupabase = createClient as jest.MockedFunction<typeof createClient>;

describe('Invite Persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createInvite', () => {
    it('should create an invite with a valid token', async () => {
      const mockInsert = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: '123',
            org_name: 'Test Corp',
            token: 'abc123',
            expires_at: new Date(),
          },
          error: null,
        }),
      }
      const mockFrom = jest.fn().mockReturnValue({ insert: () => mockInsert })
      mockedSupabase.mockReturnValue({ from: mockFrom } as any)

      const result = await createInvite({
        org_name: 'Test Corp',
        created_by: 'admin@test.com',
      })

      expect(result).not.toBeNull()
      expect(result?.org_name).toBe('Test Corp')
      expect(mockFrom).toHaveBeenCalledWith('invites')
    })

    it('should return null on database error', async () => {
      const mockInsert = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('DB error'),
        }),
      }
      const mockFrom = jest.fn().mockReturnValue({ insert: () => mockInsert })
      mockedSupabase.mockReturnValue({ from: mockFrom } as any)

      const result = await createInvite({
        org_name: 'Test Corp',
        created_by: 'admin@test.com',
      })

      expect(result).toBeNull()
    })
  })

  describe('validateInviteToken', () => {
    it('should return invite for valid token', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const mockSelect = {
        eq: jest.fn().mockReturnThis(),
        gt: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            token: 'goodToken',
            used: false,
            expires_at: futureDate.toISOString(),
          },
          error: null,
        }),
      }
      const mockFrom = jest.fn().mockReturnValue({ select: () => mockSelect })
      mockedSupabase.mockReturnValue({ from: mockFrom } as any)

      const result = await validateInviteToken('goodToken')
      expect(result).not.toBeNull()
      expect(result?.token).toBe('goodToken')
    })

    it('should return null for expired token', async () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const mockSelect = {
        eq: jest.fn().mockReturnThis(),
        gt: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Not found'),
        }),
      }
      const mockFrom = jest.fn().mockReturnValue({ select: () => mockSelect })
      mockedSupabase.mockReturnValue({ from: mockFrom } as any)

      const result = await validateInviteToken('expiredToken')
      expect(result).toBeNull()
    })

    it('should return null for already used token', async () => {
      const mockSelect = {
        eq: jest.fn().mockReturnThis(),
        gt: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Not found'),
        }),
      }
      const mockFrom = jest.fn().mockReturnValue({ select: () => mockSelect })
      mockedSupabase.mockReturnValue({ from: mockFrom } as any)

      const result = await validateInviteToken('usedToken')
      expect(result).toBeNull()
    })

    it('should return null for invalid token format', async () => {
      const result = await validateInviteToken('')
      expect(result).toBeNull()
    })
  })

  describe('markInviteUsed', () => {
    it('should return true on successful update', async () => {
      const mockUpdate = {
        eq: jest.fn().mockResolvedValue({ error: null }),
      }
      const mockFrom = jest.fn().mockReturnValue({ update: () => mockUpdate })
      mockedSupabase.mockReturnValue({ from: mockFrom } as any)

      const result = await markInviteUsed('someToken')
      expect(result).toBe(true)
    })

    it('should return false on update error', async () => {
      const mockUpdate = {
        eq: jest.fn().mockResolvedValue({ error: new Error('Update failed') }),
      }
      const mockFrom = jest.fn().mockReturnValue({ update: () => mockUpdate })
      mockedSupabase.mockReturnValue({ from: mockFrom } as any)

      const result = await markInviteUsed('someToken')
      expect(result).toBe(false)
    })
  })
})
