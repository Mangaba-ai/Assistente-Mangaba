import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  hubId?: string
  agentId?: string
  attachments?: {
    type: 'image' | 'file' | 'audio'
    url: string
    name: string
    size?: number
  }[]
  metadata?: {
    edited?: boolean
    editedAt?: Date
    reactions?: Record<string, number>
  }
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  hubId?: string
  agentId?: string
}

export interface Agent {
  id: string
  name: string
  description: string
  avatar?: string
  systemPrompt: string
  capabilities: string[]
  hubId: string
  isActive: boolean
  version: string
  createdAt: Date
  updatedAt: Date
  ollamaModel?: string
  configuration?: {
    temperature?: number
    maxTokens?: number
    model?: string
  }
  metadata?: {
    usage?: number
    lastUsed?: Date
    performance?: {
      averageResponseTime?: number
      successRate?: number
      totalInteractions?: number
    }
    tags?: string[]
  }
}

export interface Hub {
  id: string
  name: string
  description: string
  icon: string
  color: string
  agents: Agent[]
  createdAt: Date
  updatedAt: Date
  category?: string
  tags: string[]
  isActive: boolean
  metadata?: {
    version?: string
    author?: string
    lastModified?: Date
    usage?: number
  }
}

interface ChatStore {
  chats: Chat[]
  currentChatId: string | null
  hubs: Hub[]
  selectedHubId: string | null
  selectedAgentId: string | null
  isTyping: boolean
  
  // Chat actions
  createChat: (hubId?: string, agentId?: string) => Promise<string>
  deleteChat: (chatId: string) => void
  setCurrentChat: (chatId: string) => void
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void
  updateChatTitle: (chatId: string, title: string) => void
  clearChats: () => void
  clearAllChats: () => void
  exportData: () => string
  importData: (data: string) => void
  
  // Hub actions
  createHub: (hub: Omit<Hub, 'id' | 'createdAt' | 'agents'>) => string
  updateHub: (hubId: string, updates: Partial<Hub>) => void
  deleteHub: (hubId: string) => void
  setSelectedHub: (hubId: string | null) => void
  loadHubsFromBackend: () => Promise<void>
  
  // Agent actions
  createAgent: (hubId: string, agent: Omit<Agent, 'id' | 'hubId'>) => string
  updateAgent: (hubId: string, agentId: string, updates: Partial<Omit<Agent, 'id' | 'hubId' | 'createdAt'>>) => void
  deleteAgent: (agentId: string) => void
  setSelectedAgent: (agentId: string | null) => void
  loadAgentsFromBackend: () => Promise<void>
  
  // UI actions
  setTyping: (isTyping: boolean) => void
  
  // Getters
  getCurrentChat: () => Chat | null
  getSelectedHub: () => Hub | null
  getSelectedAgent: () => Agent | null
  getActiveHubs: () => Hub[]
  getHubsByCategory: (category: string) => Hub[]
  getHubsByTag: (tag: string) => Hub[]
  getActiveAgents: (hubId: string) => Agent[]
  incrementHubUsage: (hubId: string) => void
  incrementAgentUsage: (hubId: string, agentId: string) => void
  resetHubsToDefaults: () => void
}

const defaultHubs: Hub[] = [
  {
    id: 'financial',
    name: 'Financeiro',
    description: 'Análise financeira, investimentos e planejamento',
    icon: 'DollarSign',
    color: 'emerald',
    createdAt: new Date(),
    updatedAt: new Date(),
    category: 'business',
    tags: ['finanças', 'investimentos', 'contabilidade'],
    isActive: true,
    metadata: {
      version: '1.0.0',
      author: 'Mangaba AI',
      usage: 0
    },
    agents: [
      {
        id: 'financial-analyst',
        name: 'Analista Financeiro',
        description: 'Especialista em análise de investimentos e mercado financeiro',
        systemPrompt: 'Você é um analista financeiro experiente. Forneça análises detalhadas sobre investimentos, mercado financeiro e planejamento econômico.',
        capabilities: ['Análise de investimentos', 'Planejamento financeiro', 'Análise de mercado'],
        hubId: 'financial',
        isActive: true,
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        configuration: {
          temperature: 0.7,
          maxTokens: 2048,
          model: 'llama2:latest'
        },
        metadata: {
          usage: 0,
          performance: {
            averageResponseTime: 0,
            successRate: 100
          }
        }
      },
      {
        id: 'accountant',
        name: 'Contador',
        description: 'Especialista em contabilidade e impostos',
        systemPrompt: 'Você é um contador experiente. Ajude com questões contábeis, impostos e compliance fiscal.',
        capabilities: ['Contabilidade', 'Impostos', 'Compliance fiscal'],
        hubId: 'financial',
        isActive: true,
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        configuration: {
          temperature: 0.5,
          maxTokens: 2048,
          model: 'llama2:latest'
        },
        metadata: {
          usage: 0,
          performance: {
            averageResponseTime: 0,
            successRate: 100
          }
        }
      }
    ]
  },
  {
    id: 'technology',
    name: 'Tecnologia',
    description: 'Desenvolvimento, programação e soluções técnicas',
    icon: 'Code',
    color: 'slate',
    createdAt: new Date(),
    updatedAt: new Date(),
    category: 'technical',
    tags: ['programação', 'desenvolvimento', 'devops'],
    isActive: true,
    metadata: {
      version: '1.0.0',
      author: 'Mangaba AI',
      usage: 0
    },
    agents: [
      {
        id: 'developer',
        name: 'Desenvolvedor',
        description: 'Especialista em programação e desenvolvimento de software',
        systemPrompt: 'Você é um desenvolvedor sênior. Ajude com programação, arquitetura de software e melhores práticas de desenvolvimento.',
        capabilities: ['Programação', 'Arquitetura de software', 'Code review'],
        hubId: 'technology',
        isActive: true,
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        configuration: {
          temperature: 0.3,
          maxTokens: 4096,
          model: 'codellama:latest'
        },
        metadata: {
          usage: 0,
          performance: {
            averageResponseTime: 0,
            successRate: 100
          }
        }
      },
      {
        id: 'devops',
        name: 'DevOps Engineer',
        description: 'Especialista em infraestrutura e deployment',
        systemPrompt: 'Você é um engenheiro DevOps experiente. Ajude com infraestrutura, CI/CD e deployment de aplicações.',
        capabilities: ['Infraestrutura', 'CI/CD', 'Monitoramento'],
        hubId: 'technology',
        isActive: true,
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        configuration: {
          temperature: 0.4,
          maxTokens: 3072,
          model: 'llama2:latest'
        },
        metadata: {
          usage: 0,
          performance: {
            averageResponseTime: 0,
            successRate: 100
          }
        }
      }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Estratégias de marketing e comunicação',
    icon: 'Megaphone',
    color: 'zinc',
    createdAt: new Date(),
    updatedAt: new Date(),
    category: 'business',
    tags: ['marketing', 'comunicação', 'vendas'],
    isActive: true,
    metadata: {
      version: '1.0.0',
      author: 'Mangaba AI',
      usage: 0
    },
    agents: [
      {
        id: 'marketing-specialist',
        name: 'Especialista em Marketing',
        description: 'Especialista em estratégias de marketing digital',
        systemPrompt: 'Você é um especialista em marketing digital. Ajude com estratégias de marketing, campanhas e análise de mercado.',
        capabilities: ['Marketing digital', 'Campanhas', 'Análise de mercado'],
        hubId: 'marketing',
        isActive: true,
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        configuration: {
          temperature: 0.8,
          maxTokens: 2048,
          model: 'mistral:latest'
        },
        metadata: {
          usage: 0,
          performance: {
            averageResponseTime: 0,
            successRate: 100
          }
        }
      }
    ]
  }
]

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
        chats: [],
        currentChatId: null,
        hubs: defaultHubs,
        selectedHubId: null,
        selectedAgentId: null,
        isTyping: false,
      
      createChat: async (hubId, agentId) => {
        try {
          const token = localStorage.getItem('token')
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
          
          const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              title: 'Nova Conversa',
              hubId,
              agentId
            })
          })
          
          if (!response.ok) {
            throw new Error('Failed to create chat')
          }
          
          const result = await response.json()
          const backendChat = result.data
          
          const newChat: Chat = {
            id: backendChat.id,
            title: backendChat.title,
            messages: [],
            createdAt: new Date(backendChat.createdAt),
            updatedAt: new Date(backendChat.updatedAt),
            hubId: backendChat.hubId,
            agentId: backendChat.agentId
          }
          
          set((state) => ({
            chats: [newChat, ...state.chats],
            currentChatId: newChat.id
          }))
          
          return newChat.id
        } catch (error) {
          console.error('Error creating chat:', error)
          // Fallback to local creation if API fails
          const id = nanoid()
          const newChat: Chat = {
            id,
            title: 'Nova Conversa',
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            hubId,
            agentId
          }
          
          set((state) => ({
            chats: [newChat, ...state.chats],
            currentChatId: id
          }))
          
          return id
        }
      },
      
      deleteChat: (chatId) => {
        set((state) => ({
          chats: state.chats.filter(chat => chat.id !== chatId),
          currentChatId: state.currentChatId === chatId ? null : state.currentChatId
        }))
      },
      
      setCurrentChat: (chatId) => {
        set({ currentChatId: chatId })
      },
      
      addMessage: (chatId, message) => {
        const newMessage: Message = {
          ...message,
          id: nanoid(),
          timestamp: new Date()
        }
        
        set((state) => ({
          chats: state.chats.map(chat => 
            chat.id === chatId 
              ? { 
                  ...chat, 
                  messages: [...chat.messages, newMessage],
                  updatedAt: new Date(),
                  title: chat.messages.length === 0 ? message.content.slice(0, 50) + '...' : chat.title
                }
              : chat
          )
        }))
      },
      
      updateChatTitle: (chatId, title) => {
        set((state) => ({
          chats: state.chats.map(chat => 
            chat.id === chatId ? { ...chat, title } : chat
          )
        }))
      },
      
      clearChats: () => {
        set({ chats: [], currentChatId: null })
      },

      clearAllChats: () => {
        set({ chats: [], currentChatId: null })
      },

      exportData: () => {
        const state = get()
        return JSON.stringify({
          chats: state.chats,
          hubs: state.hubs
        })
      },

      importData: (data: string) => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.chats && parsed.hubs) {
            set({
              chats: parsed.chats,
              hubs: parsed.hubs,
              currentChatId: null,
              selectedHubId: null,
              selectedAgentId: null
            })
          }
        } catch (error) {
          console.error('Failed to import data:', error)
        }
      },
      
      createHub: (hubData) => {
        const id = nanoid()
        const newHub: Hub = {
          ...hubData,
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: hubData.isActive ?? true,
          metadata: hubData.metadata ?? {
            version: '1.0.0',
            author: 'User',
            usage: 0
          },
          agents: []
        }
        
        set((state) => ({
          hubs: [...state.hubs, newHub]
        }))
        
        return id
      },
      
      updateHub: (hubId, updates) => {
        set((state) => ({
          hubs: state.hubs.map(hub => 
            hub.id === hubId 
              ? { 
                  ...hub, 
                  ...updates, 
                  updatedAt: new Date(),
                  metadata: {
                    ...hub.metadata,
                    ...updates.metadata
                  }
                }
              : hub
          )
        }))
      },
      
      deleteHub: (hubId) => {
        set((state) => ({
          hubs: state.hubs.filter(hub => hub.id !== hubId),
          selectedHubId: state.selectedHubId === hubId ? null : state.selectedHubId
        }))
      },
      
      setSelectedHub: (hubId) => {
        set({ selectedHubId: hubId, selectedAgentId: null })
      },
      
      createAgent: (hubId, agentData) => {
        const id = nanoid()
        const newAgent: Agent = {
          ...agentData,
          id,
          hubId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: agentData.isActive ?? true,
          version: agentData.version ?? '1.0.0',
          metadata: agentData.metadata ?? {
            usage: 0,
            performance: {
              averageResponseTime: 0,
              successRate: 100
            }
          }
        }
        
        set((state) => ({
          hubs: state.hubs.map(hub => 
            hub.id === hubId 
              ? { 
                  ...hub, 
                  agents: [...hub.agents, newAgent],
                  updatedAt: new Date()
                }
              : hub
          )
        }))
        
        return id
      },
      
      deleteAgent: (agentId) => {
        set((state) => ({
          hubs: state.hubs.map(hub => ({
            ...hub,
            agents: hub.agents.filter(agent => agent.id !== agentId)
          })),
          selectedAgentId: state.selectedAgentId === agentId ? null : state.selectedAgentId
        }))
      },
      
      setSelectedAgent: (agentId) => {
        console.log('ChatStore: setSelectedAgent called with:', agentId)
        set({ selectedAgentId: agentId })
        console.log('ChatStore: selectedAgentId updated to:', agentId)
      },

      updateAgent: (hubId, agentId, updates) => {
        set((state) => ({
          hubs: state.hubs.map(hub => 
            hub.id === hubId
              ? {
                  ...hub,
                  agents: hub.agents.map(agent => 
                    agent.id === agentId
                      ? {
                          ...agent,
                          ...updates,
                          updatedAt: new Date(),
                          metadata: {
                            ...agent.metadata,
                            ...updates.metadata
                          }
                        }
                      : agent
                  ),
                  updatedAt: new Date()
                }
              : hub
          )
        }))
      },

      getActiveHubs: () => {
        const state = get()
        return state.hubs.filter(hub => hub.isActive)
      },

      getHubsByCategory: (category) => {
        const state = get()
        return state.hubs.filter(hub => hub.category === category && hub.isActive)
      },

      getHubsByTag: (tag) => {
        const state = get()
        return state.hubs.filter(hub => hub.tags.includes(tag) && hub.isActive)
      },

      getActiveAgents: (hubId) => {
        const state = get()
        const hub = state.hubs.find(h => h.id === hubId)
        return hub ? hub.agents.filter(agent => agent.isActive) : []
      },

      incrementHubUsage: (hubId) => {
        set((state) => ({
          hubs: state.hubs.map(hub => 
            hub.id === hubId
              ? {
                  ...hub,
                  metadata: {
                    ...hub.metadata,
                    usage: (hub.metadata?.usage || 0) + 1
                  },
                  updatedAt: new Date()
                }
              : hub
          )
        }))
      },

      incrementAgentUsage: (hubId, agentId) => {
        set((state) => ({
          hubs: state.hubs.map(hub => 
            hub.id === hubId
              ? {
                  ...hub,
                  agents: hub.agents.map(agent => 
                    agent.id === agentId
                      ? {
                          ...agent,
                          metadata: {
                            ...agent.metadata,
                            usage: (agent.metadata?.usage || 0) + 1
                          },
                          updatedAt: new Date()
                        }
                      : agent
                  ),
                  updatedAt: new Date()
                }
              : hub
          )
        }))
      },
      
      setTyping: (isTyping) => {
        set({ isTyping })
      },
      
      getCurrentChat: () => {
        const state = get()
        return state.chats.find(chat => chat.id === state.currentChatId) || null
      },
      
      getSelectedHub: () => {
        const state = get()
        return state.hubs.find(hub => hub.id === state.selectedHubId) || null
      },
      
      getSelectedAgent: () => {
        const state = get()
        return state.selectedAgentId ? state.hubs.find(h => h.agents.some(a => a.id === state.selectedAgentId))?.agents.find(a => a.id === state.selectedAgentId) || null : null
      },
      
      // Utility function to reset hubs to defaults
      loadHubsFromBackend: async () => {
        try {
          const token = localStorage.getItem('token')
          if (!token) {
            console.log('No token found, using default hubs')
            return
          }

          const response = await fetch('http://localhost:5000/api/hubs', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const backendResponse = await response.json()
            const backendHubs = backendResponse.data || backendResponse
            console.log('Loaded hubs from backend:', backendHubs)
            
            // Merge backend hubs with default agents
            const mergedHubs = backendHubs.map((backendHub: any) => {
              const defaultHub = defaultHubs.find(h => h.name === backendHub.name)
              return {
                ...backendHub,
                agents: defaultHub ? defaultHub.agents : [],
                createdAt: new Date(backendHub.createdAt),
                updatedAt: new Date(backendHub.updatedAt)
              }
            })
            
            set((state) => ({
              ...state,
              hubs: mergedHubs
            }))
          } else {
            console.log('Failed to load hubs from backend, using defaults')
          }
        } catch (error) {
          console.error('Error loading hubs from backend:', error)
        }
      },

      loadAgentsFromBackend: async () => {
        try {
          const token = localStorage.getItem('token')
          if (!token) {
            console.log('No token found, cannot load agents')
            return
          }

          const response = await fetch('http://localhost:5000/api/agents', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const backendResponse = await response.json()
            const backendAgents = backendResponse.data || backendResponse
            console.log('Loaded agents from backend:', backendAgents)
            
            // Group agents by category and merge with hubs
            const agentsByHubId: Record<string, any[]> = {
              '1': [], // Trabalho
              '2': [], // Pessoal
              '3': [], // Educação
              '4': []  // Hub Teste
            }
            
            backendAgents.forEach((agent: any) => {
              // Map agent categories to hub IDs
              let hubId = '1' // default to Trabalho
              if (agent.category === 'assistant') {
                hubId = '1' // Trabalho
              } else if (agent.category === 'creative') {
                hubId = '2' // Pessoal
              } else if (agent.category === 'educational') {
                hubId = '3' // Educação
              } else {
                hubId = '1' // Default to Trabalho
              }
              
              if (!agentsByHubId[hubId]) {
                agentsByHubId[hubId] = []
              }
              
              agentsByHubId[hubId].push({
                id: agent.id,
                name: agent.name,
                description: agent.description,
                systemPrompt: agent.configuration?.systemPrompt || 'Você é um assistente útil.',
                capabilities: agent.prompts ? [agent.prompts.greeting] : ['Assistência geral'],
                hubId: hubId,
                isActive: agent.settings?.isActive || true,
                version: '1.0.0',
                createdAt: new Date(agent.createdAt),
                updatedAt: new Date(agent.updatedAt),
                configuration: {
                  temperature: agent.configuration?.temperature || 0.7,
                  maxTokens: agent.configuration?.maxTokens || 2048,
                  model: agent.configuration?.model || 'llama2:latest'
                },
                metadata: {
                  usage: agent.stats?.usageCount || 0,
                  performance: {
                    averageResponseTime: 0,
                    successRate: 100
                  }
                }
              })
            })
            
            set((state) => ({
               ...state,
               hubs: state.hubs.map(hub => ({
                 ...hub,
                 agents: agentsByHubId[hub.id] || hub.agents
               }))
             }))
          } else {
            console.log('Failed to load agents from backend')
          }
        } catch (error) {
          console.error('Error loading agents from backend:', error)
        }
      },

      resetHubsToDefaults: () => {
        set((state) => ({
          ...state,
          hubs: defaultHubs,
          selectedHubId: null,
          selectedAgentId: null
        }))
      }
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        chats: state.chats,
        hubs: state.hubs,
        selectedHubId: state.selectedHubId,
        selectedAgentId: state.selectedAgentId
      }),
      onRehydrateStorage: () => (state) => {
        if (state && (!state.hubs || state.hubs.length === 0)) {
          console.log('No hubs found in storage, restoring defaults')
          state.hubs = defaultHubs
        }
        console.log('Store rehydrated with hubs:', state?.hubs?.length || 0)
      }
    }
  )
)

// Expose store globally for debugging
if (typeof window !== 'undefined') {
  (window as any).useChatStore = useChatStore
}