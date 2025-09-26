// Tipos comuns e utilitários

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  code?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

export interface SearchParams {
  query?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, any>
}

export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  icon?: string
}

export interface ColorOption {
  name: string
  class: string
  hex?: string
}

export interface IconOption {
  name: string
  component: React.ComponentType
  category?: string
}

export type Theme = 'light' | 'dark' | 'system'

export type Status = 'idle' | 'loading' | 'success' | 'error'

export type SortOrder = 'asc' | 'desc'

export type FileType = 'image' | 'document' | 'audio' | 'video' | 'text' | 'other'

// Tipos de eventos
export interface BaseEvent {
  id: string
  type: string
  timestamp: Date
  userId?: string
}

export interface ChatEvent extends BaseEvent {
  type: 'chat_created' | 'message_sent' | 'chat_deleted'
  chatId: string
  messageId?: string
}

export interface HubEvent extends BaseEvent {
  type: 'hub_created' | 'hub_updated' | 'hub_deleted'
  hubId: string
}

export interface AgentEvent extends BaseEvent {
  type: 'agent_created' | 'agent_updated' | 'agent_deleted'
  agentId: string
  hubId: string
}

// Tipos de configuração
export interface AppConfig {
  apiUrl: string
  ollamaUrl: string
  maxFileSize: number
  supportedFileTypes: string[]
  defaultModel: string
  features: FeatureFlags
}

export interface FeatureFlags {
  fileUpload: boolean
  voiceInput: boolean
  imageGeneration: boolean
  codeExecution: boolean
  webSearch: boolean
}