// Utilitários para autenticação e autorização
import type { User, AuthState, LoginCredentials, RegisterData } from '../types'
import { getToken, setToken, removeToken, getUser, setUser } from './storage'
import { apiClient } from './api'

// Verificar se o usuário está autenticado
export const isAuthenticated = (): boolean => {
  const token = getToken()
  return !!token && !isTokenExpired(token)
}

// Verificar se o token está expirado
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = parseJWT(token)
    if (!payload.exp) return false
    
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch {
    return true
  }
}

// Fazer parse do JWT
export const parseJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    throw new Error('Token inválido')
  }
}

// Obter informações do usuário do token
export const getUserFromToken = (token: string): Partial<User> | null => {
  try {
    const payload = parseJWT(token)
    return {
      id: payload.sub || payload.userId,
      email: payload.email,
      name: payload.name
    }
  } catch {
    return null
  }
}

// Login
export const login = async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; token?: string; error?: string }> => {
  try {
    const response = await apiClient.post<{ token: string; user: User }>('/auth/login', credentials)
    
    if (response.success && response.data) {
      const { token, user } = response.data
      
      // Armazenar token
      setToken(token)
      
      // Armazenar usuário
      setUser(user)
      
      return { success: true, user, token }
    }
    
    return { success: false, error: 'Login failed' }
  } catch (error: any) {
    return { success: false, error: error.message || 'Login failed' }
  }
}

// Registro
export const register = async (data: RegisterData): Promise<{ success: boolean; user?: User; token?: string; error?: string }> => {
  try {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password
    }
    
    const response = await apiClient.post<{ token: string; user: User }>('/auth/register', payload)
    
    if (response.success && response.data) {
      const { token, user } = response.data
      
      // Armazenar token
      setToken(token)
      
      // Armazenar usuário
      setUser(user)
      
      return { success: true, user, token }
    }
    
    return { success: false, error: 'Registration failed' }
  } catch (error: any) {
    return { success: false, error: error.message || 'Registration failed' }
  }
}

// Logout
export const logout = async (): Promise<void> => {
  try {
    // Tentar fazer logout no servidor
    await apiClient.post('/auth/logout')
  } catch {
    // Ignorar erros do servidor no logout
  } finally {
    // Sempre limpar dados locais
    removeToken()
    setUser(null)
  }
}

// Refresh token
export const refreshToken = async (): Promise<boolean> => {
  try {
    const response = await apiClient.post<{ token: string; user: User }>('/auth/refresh')
    
    if (response.success && response.data) {
      const { token, user } = response.data
      setToken(token)
      setUser(user)
      return true
    }
    
    return false
  } catch {
    return false
  }
}

// Obter usuário atual
export const getCurrentUser = async (): Promise<User | null> => {
  // Primeiro tentar obter do storage
  const cachedUser = getUser()
  if (cachedUser) return cachedUser as User
  
  // Se não tiver no cache, buscar do servidor
  try {
    const response = await apiClient.get<User>('/auth/profile')
    
    if (response.success && response.data) {
      setUser(response.data)
      return response.data
    }
  } catch {
    // Se falhar, fazer logout
    await logout()
  }
  
  return null
}

// Atualizar perfil do usuário
export const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const response = await apiClient.put<User>('/auth/profile', updates)
    
    if (response.success && response.data) {
      setUser(response.data)
      return { success: true, user: response.data }
    }
    
    return { success: false, error: response.error || 'Erro ao atualizar perfil' }
  } catch (error) {
    return { success: false, error: 'Erro de conexão' }
  }
}

// Alterar senha
export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await apiClient.put('/auth/password', {
      currentPassword,
      newPassword
    })
    
    if (response.success) {
      return { success: true }
    }
    
    return { success: false, error: response.error || 'Erro ao alterar senha' }
  } catch (error) {
    return { success: false, error: 'Erro de conexão' }
  }
}

// Solicitar reset de senha
export const requestPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await apiClient.post('/auth/forgot-password', { email })
    
    if (response.success) {
      return { success: true }
    }
    
    return { success: false, error: response.error || 'Erro ao solicitar reset' }
  } catch (error) {
    return { success: false, error: 'Erro de conexão' }
  }
}

// Reset de senha
export const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      password: newPassword
    })
    
    if (response.success) {
      return { success: true }
    }
    
    return { success: false, error: response.error || 'Erro ao resetar senha' }
  } catch (error) {
    return { success: false, error: 'Erro de conexão' }
  }
}

// Verificar permissões
export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false
  
  // Se o usuário for admin, tem todas as permissões
  if (user.role === 'admin') return true
  
  // Verificar permissões específicas
  return user.permissions?.includes(permission) || false
}

// Verificar se é admin
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin' || false
}

// Verificar se é moderador
export const isModerator = (user: User | null): boolean => {
  return user?.role === 'moderator' || isAdmin(user)
}

// Obter estado de autenticação completo
export const getAuthState = async (): Promise<AuthState> => {
  const token = getToken()
  
  if (!token || isTokenExpired(token)) {
    return {
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: false,
    error: null
  }
  }
  
  const user = await getCurrentUser()
  
  return {
    isAuthenticated: !!user,
    user,
    token,
    isLoading: false,
    error: null
  }
}

// Middleware para verificar autenticação
export const requireAuth = (callback: () => void): void => {
  if (isAuthenticated()) {
    callback()
  } else {
    // Redirecionar para login ou mostrar modal
    window.location.href = '/login'
  }
}

// Middleware para verificar permissões
export const requirePermission = (permission: string, callback: () => void): void => {
  const user = getUser()
  
  if (hasPermission(user as User | null, permission)) {
    callback()
  } else {
    throw new Error('Permissão negada')
  }
}