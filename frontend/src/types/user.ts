export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'moderator' | 'user'
  permissions?: string[]
  preferences: UserPreferences
  subscription: UserSubscription
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: NotificationSettings
  defaultHub?: string
  defaultAgent?: string
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  desktop: boolean
  sound: boolean
}

export interface UserSubscription {
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'inactive' | 'cancelled'
  expiresAt?: Date
  features: string[]
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}