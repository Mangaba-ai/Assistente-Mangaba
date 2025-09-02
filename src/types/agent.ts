export interface Agent {
  id: string
  name: string
  description: string
  systemPrompt: string
  ollamaModel: string
  hubId: string
  avatar?: string
  color: string
  capabilities: AgentCapability[]
  settings: AgentSettings
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface AgentCapability {
  id: string
  name: string
  description: string
  enabled: boolean
}

export interface AgentSettings {
  temperature: number
  maxTokens: number
  topP: number
  topK: number
  repeatPenalty: number
  contextWindow: number
}

export interface AgentFormData {
  name: string
  description: string
  systemPrompt: string
  ollamaModel: string
  color: string
  capabilities: string[]
  settings: Partial<AgentSettings>
}

export interface AgentStats {
  totalChats: number
  totalMessages: number
  averageResponseTime: number
  lastUsed: Date
}