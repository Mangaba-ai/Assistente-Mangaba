// Constantes utilitárias para funções auxiliares
import type { FileType } from '../types'

// Extensões de arquivo por categoria
export const FILE_EXTENSIONS: Record<FileType, string[]> = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'],
  document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt'],
  text: ['txt', 'md', 'json', 'xml', 'csv', 'log', 'yaml', 'yml', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'sass', 'less', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt'],
  audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'],
  video: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'],
  other: []
}

// MIME types por categoria
export const MIME_TYPES: Record<FileType, string[]> = {
  image: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/svg+xml',
    'image/webp',
    'image/x-icon'
  ],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/rtf',
    'application/vnd.oasis.opendocument.text'
  ],
  text: [
    'text/plain',
    'text/markdown',
    'application/json',
    'application/xml',
    'text/xml',
    'text/csv',
    'application/x-yaml',
    'text/yaml',
    'text/javascript',
    'application/javascript',
    'text/typescript',
    'text/html',
    'text/css',
    'text/x-python',
    'text/x-java-source',
    'text/x-c',
    'text/x-csharp',
    'application/x-php',
    'text/x-ruby',
    'text/x-go',
    'text/x-rust',
    'text/x-swift'
  ],
  audio: [
    'audio/mpeg',
    'audio/wav',
    'audio/flac',
    'audio/aac',
    'audio/ogg',
    'audio/mp4'
  ],
  video: [
    'video/mp4',
    'video/x-msvideo',
    'video/x-matroska',
    'video/quicktime',
    'video/x-ms-wmv',
    'video/x-flv',
    'video/webm'
  ],
  other: []
}

// Tamanhos de arquivo em bytes
export const FILE_SIZES = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  TB: 1024 * 1024 * 1024 * 1024
} as const

// Limites de tamanho por tipo de arquivo
export const FILE_SIZE_LIMITS: Record<FileType, number> = {
  image: 10 * FILE_SIZES.MB,
  document: 50 * FILE_SIZES.MB,
  text: 5 * FILE_SIZES.MB,
  audio: 50 * FILE_SIZES.MB,
  video: 500 * FILE_SIZES.MB,
  other: 10 * FILE_SIZES.MB
}

// Expressões regulares úteis
export const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  ipv6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  base64: /^[A-Za-z0-9+/]*={0,2}$/,
  jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
}

// Códigos de status HTTP
export const HTTP_STATUS = {
  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // 3xx Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  
  // 4xx Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // 5xx Server Error
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const

// Mensagens de erro padrão
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  TIMEOUT_ERROR: 'Tempo limite excedido. Tente novamente.',
  UNAUTHORIZED: 'Acesso não autorizado. Faça login novamente.',
  FORBIDDEN: 'Você não tem permissão para esta ação.',
  NOT_FOUND: 'Recurso não encontrado.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos.',
  SERVER_ERROR: 'Erro interno do servidor. Tente novamente mais tarde.',
  FILE_TOO_LARGE: 'Arquivo muito grande.',
  INVALID_FILE_TYPE: 'Tipo de arquivo não suportado.',
  UPLOAD_FAILED: 'Falha no upload do arquivo.',
  DOWNLOAD_FAILED: 'Falha no download do arquivo.'
} as const

// Configurações de retry
export const RETRY_CONFIG = {
  DEFAULT_ATTEMPTS: 3,
  DEFAULT_DELAY: 1000,
  MAX_DELAY: 10000,
  BACKOFF_FACTOR: 2
} as const

// Timeouts em milissegundos
export const TIMEOUTS = {
  API_REQUEST: 30000,
  FILE_UPLOAD: 120000,
  WEBSOCKET_CONNECT: 10000,
  DEBOUNCE_SEARCH: 300,
  DEBOUNCE_INPUT: 500,
  TOAST_DURATION: 5000,
  LOADING_DELAY: 200
} as const

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5
} as const

// Configurações de cache
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutos
  MAX_SIZE: 100,
  CLEANUP_INTERVAL: 60 * 1000 // 1 minuto
} as const

// Eventos personalizados
export const CUSTOM_EVENTS = {
  THEME_CHANGE: 'themeChange',
  USER_LOGIN: 'userLogin',
  USER_LOGOUT: 'userLogout',
  CHAT_MESSAGE: 'chatMessage',
  HUB_CHANGE: 'hubChange',
  AGENT_CHANGE: 'agentChange',
  CONNECTION_CHANGE: 'connectionChange',
  ERROR_OCCURRED: 'errorOccurred'
} as const

// Configurações de animação
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const

// Breakpoints responsivos
export const BREAKPOINTS = {
  XS: 480,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536
} as const

// Z-index layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080
} as const