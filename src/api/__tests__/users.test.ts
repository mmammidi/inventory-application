import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listUsers, getUser, createUser, updateUser, deleteUser } from '../users'
import apiClient from '../http'

// Mock the API client
vi.mock('../http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Users API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listUsers', () => {
    it('should return normalized users array', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            username: 'johndoe'
          },
          {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            username: 'janesmith'
          }
        ]
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await listUsers()

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/users')
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        username: 'johndoe'
      })
    })

    it('should handle different API response structures', async () => {
      const mockResponse = {
        data: {
          users: [
            {
              id: '1',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john@example.com'
            }
          ]
        }
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await listUsers()

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        username: undefined
      })
    })

    it('should handle empty response', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] })

      const result = await listUsers()

      expect(result).toEqual([])
    })
  })

  describe('getUser', () => {
    it('should return normalized user', async () => {
      const mockResponse = {
        data: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          username: 'johndoe'
        }
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await getUser('1')

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/users/1')
      expect(result).toEqual({
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        username: 'johndoe'
      })
    })
  })

  describe('createUser', () => {
    it('should create user with correct data', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'johndoe'
      }

      const mockResponse = {
        data: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          username: 'johndoe'
        }
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await createUser(userData)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/users', userData)
      expect(result).toEqual({
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        username: 'johndoe'
      })
    })
  })

  describe('updateUser', () => {
    it('should update user with correct data', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'johndoe'
      }

      const mockResponse = {
        data: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          username: 'johndoe'
        }
      }

      vi.mocked(apiClient.put).mockResolvedValue(mockResponse)

      const result = await updateUser('1', userData)

      expect(apiClient.put).toHaveBeenCalledWith('/api/v1/users/1', userData)
      expect(result).toEqual({
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        username: 'johndoe'
      })
    })
  })

  describe('deleteUser', () => {
    it('should delete user', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({})

      await deleteUser('1')

      expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/users/1')
    })
  })
})
