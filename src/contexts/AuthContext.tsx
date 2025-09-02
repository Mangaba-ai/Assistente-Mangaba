import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'user' | 'admin'
  subscription: {
    plan: 'free' | 'premium'
    expiresAt?: string
  }
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    notifications: boolean
  }
  createdAt: string
  lastLoginAt: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!token

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token')
        const storedUser = localStorage.getItem('auth_user')

        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
          
          // Verify token is still valid
          await verifyToken(storedToken)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        clearAuthData()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Set up token refresh interval
  useEffect(() => {
    if (token) {
      const interval = setInterval(() => {
        refreshToken().catch(() => {
          // If refresh fails, logout user
          logout()
        })
      }, 15 * 60 * 1000) // Refresh every 15 minutes

      return () => clearInterval(interval)
    }
  }, [token])

  const verifyToken = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Token verification failed')
      }

      const data = await response.json()
      if (data.success) {
        setUser(data.data.user)
        localStorage.setItem('auth_user', JSON.stringify(data.data.user))
      } else {
        throw new Error('Invalid token')
      }
    } catch (error) {
      console.error('Token verification error:', error)
      throw error
    }
  }

  const clearAuthData = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('refresh_token')
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      if (data.success) {
        const { user: userData, token: authToken, refreshToken: refToken } = data.data
        
        setUser(userData)
        setToken(authToken)
        
        localStorage.setItem('auth_token', authToken)
        localStorage.setItem('auth_user', JSON.stringify(userData))
        localStorage.setItem('refresh_token', refToken)
        
        toast.success('Login successful!')
      } else {
        throw new Error(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'Login failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      if (data.success) {
        const { user: userData, token: authToken, refreshToken: refToken } = data.data
        
        setUser(userData)
        setToken(authToken)
        
        localStorage.setItem('auth_token', authToken)
        localStorage.setItem('auth_user', JSON.stringify(userData))
        localStorage.setItem('refresh_token', refToken)
        
        toast.success('Registration successful!')
      } else {
        throw new Error(data.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error instanceof Error ? error.message : 'Registration failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    clearAuthData()
    toast.success('Logged out successfully')
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!token) throw new Error('No authentication token')
      
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Profile update failed')
      }

      if (result.success) {
        const updatedUser = { ...user, ...result.data.user }
        setUser(updatedUser)
        localStorage.setItem('auth_user', JSON.stringify(updatedUser))
        toast.success('Profile updated successfully')
      } else {
        throw new Error(result.message || 'Profile update failed')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error(error instanceof Error ? error.message : 'Profile update failed')
      throw error
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!token) throw new Error('No authentication token')
      
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Password change failed')
      }

      if (result.success) {
        toast.success('Password changed successfully')
      } else {
        throw new Error(result.message || 'Password change failed')
      }
    } catch (error) {
      console.error('Password change error:', error)
      toast.error(error instanceof Error ? error.message : 'Password change failed')
      throw error
    }
  }

  const refreshToken = async () => {
    try {
      const refToken = localStorage.getItem('refresh_token')
      if (!refToken) throw new Error('No refresh token')
      
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: refToken })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Token refresh failed')
      }

      if (data.success) {
        const { token: newToken, refreshToken: newRefreshToken } = data.data
        
        setToken(newToken)
        localStorage.setItem('auth_token', newToken)
        
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken)
        }
      } else {
        throw new Error(data.message || 'Token refresh failed')
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider