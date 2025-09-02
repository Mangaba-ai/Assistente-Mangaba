import type { AppConfig } from '../types'

// Configurações da aplicação
export const APP_CONFIG: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  ollamaUrl: import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFileTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'text/markdown',
    'application/pdf',
    'application/json',
    'text/csv'
  ],
  defaultModel: 'llama3.2:latest',
  features: {
    fileUpload: true,
    voiceInput: false,
    imageGeneration: false,
    codeExecution: false,
    webSearch: false
  }
}

// Configurações de UI
export const UI_CONFIG = {
  sidebar: {
    defaultWidth: 280,
    minWidth: 240,
    maxWidth: 400
  },
  chat: {
    maxMessages: 100,
    autoScroll: true,
    showTimestamps: true
  },
  theme: {
    default: 'system' as const,
    storageKey: 'mangaba-theme'
  },
  animations: {
    enabled: true,
    duration: 200
  }
}

// Configurações de API
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  endpoints: {
    auth: '/auth',
    chats: '/chats',
    hubs: '/hubs',
    agents: '/agents',
    ollama: '/ollama',
    files: '/files'
  }
}

// Configurações de validação
export const VALIDATION_CONFIG = {
  hub: {
    nameMinLength: 2,
    nameMaxLength: 50,
    descriptionMaxLength: 500
  },
  agent: {
    nameMinLength: 2,
    nameMaxLength: 50,
    descriptionMaxLength: 1000,
    instructionsMaxLength: 5000
  },
  chat: {
    messageMaxLength: 10000,
    titleMaxLength: 100
  },
  user: {
    usernameMinLength: 3,
    usernameMaxLength: 30,
    passwordMinLength: 6,
    emailMaxLength: 254
  }
}

// Configurações de localStorage
export const STORAGE_KEYS = {
  theme: 'mangaba-theme',
  user: 'mangaba-user',
  token: 'mangaba-token',
  preferences: 'mangaba-preferences',
  recentChats: 'mangaba-recent-chats',
  sidebarWidth: 'mangaba-sidebar-width'
}