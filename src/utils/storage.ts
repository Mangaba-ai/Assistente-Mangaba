// Utilitários para localStorage e sessionStorage
import { STORAGE_KEYS } from '../constants'

// Wrapper para localStorage com tratamento de erros
export class LocalStorage {
  static get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return defaultValue || null
      return JSON.parse(item)
    } catch (error) {
      console.warn(`Erro ao ler localStorage para chave '${key}':`, error)
      return defaultValue || null
    }
  }

  static set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.warn(`Erro ao salvar no localStorage para chave '${key}':`, error)
      return false
    }
  }

  static remove(key: string): boolean {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Erro ao remover do localStorage para chave '${key}':`, error)
      return false
    }
  }

  static clear(): boolean {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.warn('Erro ao limpar localStorage:', error)
      return false
    }
  }

  static exists(key: string): boolean {
    return localStorage.getItem(key) !== null
  }
}

// Wrapper para sessionStorage
export class SessionStorage {
  static get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = sessionStorage.getItem(key)
      if (item === null) return defaultValue || null
      return JSON.parse(item)
    } catch (error) {
      console.warn(`Erro ao ler sessionStorage para chave '${key}':`, error)
      return defaultValue || null
    }
  }

  static set<T>(key: string, value: T): boolean {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.warn(`Erro ao salvar no sessionStorage para chave '${key}':`, error)
      return false
    }
  }

  static remove(key: string): boolean {
    try {
      sessionStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Erro ao remover do sessionStorage para chave '${key}':`, error)
      return false
    }
  }

  static clear(): boolean {
    try {
      sessionStorage.clear()
      return true
    } catch (error) {
      console.warn('Erro ao limpar sessionStorage:', error)
      return false
    }
  }
}

// Funções específicas da aplicação
export const getTheme = (): string => {
  return LocalStorage.get(STORAGE_KEYS.theme, 'system') || 'system'
}

export const setTheme = (theme: string): boolean => {
  return LocalStorage.set(STORAGE_KEYS.theme, theme)
}

export const getUser = () => {
  return LocalStorage.get(STORAGE_KEYS.user)
}

export const setUser = (user: any): boolean => {
  return LocalStorage.set(STORAGE_KEYS.user, user)
}

export const getToken = (): string | null => {
  return LocalStorage.get(STORAGE_KEYS.token)
}

export const setToken = (token: string): boolean => {
  return LocalStorage.set(STORAGE_KEYS.token, token)
}

export const removeToken = (): boolean => {
  return LocalStorage.remove(STORAGE_KEYS.token)
}

export const getPreferences = () => {
  return LocalStorage.get(STORAGE_KEYS.preferences, {})
}

export const setPreferences = (preferences: any): boolean => {
  return LocalStorage.set(STORAGE_KEYS.preferences, preferences)
}

export const getRecentChats = (): string[] => {
  return LocalStorage.get(STORAGE_KEYS.recentChats, []) || []
}

export const addRecentChat = (chatId: string): boolean => {
  const recent = getRecentChats()
  const filtered = recent.filter(id => id !== chatId)
  const updated = [chatId, ...filtered].slice(0, 10) // Manter apenas os 10 mais recentes
  return LocalStorage.set(STORAGE_KEYS.recentChats, updated)
}

export const removeRecentChat = (chatId: string): boolean => {
  const recent = getRecentChats()
  const filtered = recent.filter(id => id !== chatId)
  return LocalStorage.set(STORAGE_KEYS.recentChats, filtered)
}

export const getSidebarWidth = (): number => {
  return LocalStorage.get(STORAGE_KEYS.sidebarWidth, 280) || 280
}

export const setSidebarWidth = (width: number): boolean => {
  return LocalStorage.set(STORAGE_KEYS.sidebarWidth, width)
}