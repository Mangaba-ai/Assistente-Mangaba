export interface Hub {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category: 'business' | 'technical' | 'creative' | 'personal'
  agents: string[] // Array de IDs dos agentes
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface HubFormData {
  name: string
  description: string
  icon: string
  color: string
  category: Hub['category']
}

export interface HubStats {
  totalAgents: number
  totalChats: number
  lastActivity: Date
}