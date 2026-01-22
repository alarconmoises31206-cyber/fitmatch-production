import { addOrgUser, createDomainVerification, createJoinRequest } from '../../../infra/org-access/persistence';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js')
const mockedSupabase = createClient as jest.MockedFunction<typeof createClient>;

describe('Org Access Persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('addOrgUser', () => {
    it('should add user when seats available', async () => {
      const mockOrg = { seat_limit: 5 }
      const mockCount = { count: 3 }
      const mockInsert = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'user1', org_id: 'org1', email: 'test@example.com', status: 'pending' },
          error: null,
        }),
      }
      const mockFrom = jest.fn()
        .mockReturnValueOnce({ select: () => ({ single: () => Promise.resolve({ data: mockOrg, error: null }) }) })
        .mockReturnValueOnce({ select: () => ({ single: () => Promise.resolve({ data: mockOrg, error: null }) }) }) // same for count
        .mockReturnValueOnce({ select: () => ({ head: true }), eq: () => ({ eq: () => Promise.resolve(mockCount) }) })
        .mockReturnValueOnce({ insert: () => mockInsert })

      mockedSupabase.mockReturnValue({ from: mockFrom } as any)

      const result = await addOrgUser({
        org_id: 'org1',
        user_id: 'user1',
        email: 'test@example.com',
        role: 'member',
        invited_by: 'admin1',
      })

      expect(result).not.toBeNull()
      expect(result?.email).toBe('test@example.com')
    })

    it('should throw seat limit exceeded', async () => {
      const mockOrg = { seat_limit: 3 }
      const mockCount = { count: 3 }
      const mockFrom = jest.fn()
        .mockReturnValueOnce({ select: () => ({ single: () => Promise.resolve({ data: mockOrg, error: null }) }) })
        .mockReturnValueOnce({ select: () => ({ head: true }), eq: () => ({ eq: () => Promise.resolve(mockCount) }) })

      mockedSupabase.mockReturnValue({ from: mockFrom } as any)

      await expect(
        addOrgUser({
          org_id: 'org1',
          user_id: 'user1',
          email: 'test@example.com',
          role: 'member',
        })
      ).rejects.toThrow('Seat limit exceeded')
    })
  })

  describe('createDomainVerification', () => {
    it('should create domain verification', async () => {
      const mockInsert = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'dv1', domain: 'example.com', token: 'abc123' },
          error: null,
        }),
      }
      const mockFrom = jest.fn().mockReturnValue({ insert: () => mockInsert })
      mockedSupabase.mockReturnValue({ from: mockFrom } as any)

      const result = await createDomainVerification({
        org_id: 'org1',
        domain: 'example.com',
        verification_method: 'email',
        token: 'abc123',
        created_by: 'user1',
      })

      expect(result).not.toBeNull()
      expect(result?.domain).toBe('example.com')
    })

    it('should return null on error', async () => {
      const mockInsert = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('DB error'),
        }),
      }
      const mockFrom = jest.fn().mockReturnValue({ insert: () => mockInsert })
      mockedSupabase.mockReturnValue({ from: mockFrom } as any)

      const result = await createDomainVerification({
        org_id: 'org1',
        domain: 'example.com',
        verification_method: 'email',
        token: 'abc123',
        created_by: 'user1',
      })

      expect(result).toBeNull()
    })
  })

  describe('createJoinRequest', () => {
    it('should create join request', async () => {
      const mockInsert = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'jr1', email: 'user@example.com', status: 'pending' },
          error: null,
        }),
      }
      const mockFrom = jest.fn().mockReturnValue({ insert: () => mockInsert })
      mockedSupabase.mockReturnValue({ from: mockFrom } as any)

      const result = await createJoinRequest({
        org_id: 'org1',
        user_id: 'user1',
        email: 'user@example.com',
        domain: 'example.com',
      })

      expect(result).not.toBeNull()
      expect(result?.status).toBe('pending')
    })
  })
})
