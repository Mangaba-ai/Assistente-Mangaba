// Rotas da aplicação

export const ROUTES = {
  // Rotas principais
  HOME: '/',
  CHAT: '/chat',
  HUBS: '/hubs',
  AGENTS: '/agents',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  
  // Rotas de autenticação
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Rotas dinâmicas
  CHAT_ID: (id: string) => `/chat/${id}`,
  HUB_ID: (id: string) => `/hubs/${id}`,
  AGENT_ID: (id: string) => `/agents/${id}`,
  HUB_AGENT: (hubId: string, agentId: string) => `/hubs/${hubId}/agents/${agentId}`,
  
  // Rotas de configuração
  SETTINGS_GENERAL: '/settings/general',
  SETTINGS_APPEARANCE: '/settings/appearance',
  SETTINGS_MODELS: '/settings/models',
  SETTINGS_INTEGRATIONS: '/settings/integrations',
  SETTINGS_PRIVACY: '/settings/privacy',
  
  // Rotas de API
  API: {
    BASE: '/api',
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      PROFILE: '/api/auth/profile'
    },
    CHATS: {
      LIST: '/api/chats',
      CREATE: '/api/chats',
      GET: (id: string) => `/api/chats/${id}`,
      UPDATE: (id: string) => `/api/chats/${id}`,
      DELETE: (id: string) => `/api/chats/${id}`,
      MESSAGES: (id: string) => `/api/chats/${id}/messages`
    },
    HUBS: {
      LIST: '/api/hubs',
      CREATE: '/api/hubs',
      GET: (id: string) => `/api/hubs/${id}`,
      UPDATE: (id: string) => `/api/hubs/${id}`,
      DELETE: (id: string) => `/api/hubs/${id}`,
      AGENTS: (id: string) => `/api/hubs/${id}/agents`
    },
    AGENTS: {
      LIST: '/api/agents',
      CREATE: '/api/agents',
      GET: (id: string) => `/api/agents/${id}`,
      UPDATE: (id: string) => `/api/agents/${id}`,
      DELETE: (id: string) => `/api/agents/${id}`
    },
    OLLAMA: {
      STATUS: '/api/ollama/status',
      MODELS: '/api/ollama/models',
      GENERATE: '/api/ollama/generate',
      CHAT: '/api/ollama/chat',
      PULL: '/api/ollama/pull',
      DELETE: '/api/ollama/delete'
    },
    FILES: {
      UPLOAD: '/api/files/upload',
      GET: (id: string) => `/api/files/${id}`,
      DELETE: (id: string) => `/api/files/${id}`
    }
  }
}

// Navegação breadcrumb
export const BREADCRUMB_LABELS = {
  [ROUTES.HOME]: 'Início',
  [ROUTES.CHAT]: 'Chat',
  [ROUTES.HUBS]: 'Hubs',
  [ROUTES.AGENTS]: 'Agentes',
  [ROUTES.SETTINGS]: 'Configurações',
  [ROUTES.PROFILE]: 'Perfil',
  [ROUTES.SETTINGS_GENERAL]: 'Geral',
  [ROUTES.SETTINGS_APPEARANCE]: 'Aparência',
  [ROUTES.SETTINGS_MODELS]: 'Modelos',
  [ROUTES.SETTINGS_INTEGRATIONS]: 'Integrações',
  [ROUTES.SETTINGS_PRIVACY]: 'Privacidade'
}

// Rotas protegidas (requerem autenticação)
export const PROTECTED_ROUTES = [
  ROUTES.CHAT,
  ROUTES.HUBS,
  ROUTES.AGENTS,
  ROUTES.SETTINGS,
  ROUTES.PROFILE
]

// Rotas públicas (não requerem autenticação)
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD
]