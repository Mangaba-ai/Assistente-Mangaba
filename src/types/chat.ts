export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  files?: FileAttachment[]
  metadata?: MessageMetadata
}

export interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  url?: string
  content?: string
}

export interface MessageMetadata {
  model?: string
  tokens?: number
  duration?: number
  error?: string
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  hubId?: string
  agentId?: string
  createdAt: Date
  updatedAt: Date
  isArchived?: boolean
}

export interface ChatState {
  chats: Chat[]
  currentChatId: string | null
  isTyping: boolean
}