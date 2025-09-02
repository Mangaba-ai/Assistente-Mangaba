// Utilitários de formatação

// Formatação de datas
export const formatDate = (date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (format === 'relative') {
    return formatRelativeTime(d)
  }
  
  const options: Intl.DateTimeFormatOptions = format === 'long' 
    ? { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }
    : { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }
  
  return d.toLocaleDateString('pt-BR', options)
}

export const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (seconds < 60) return 'agora'
  if (minutes < 60) return `${minutes}m atrás`
  if (hours < 24) return `${hours}h atrás`
  if (days < 7) return `${days}d atrás`
  
  return formatDate(date, 'short')
}

// Formatação de tamanhos de arquivo
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Formatação de números
export const formatNumber = (num: number, locale = 'pt-BR'): string => {
  return new Intl.NumberFormat(locale).format(num)
}

export const formatCurrency = (amount: number, currency = 'BRL', locale = 'pt-BR'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount)
}

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`
}

// Formatação de texto
export const truncateText = (text: string, maxLength: number, suffix = '...'): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - suffix.length) + suffix
}

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export const capitalizeWords = (text: string): string => {
  return text.replace(/\b\w/g, char => char.toUpperCase())
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim()
}

// Formatação de IDs
export const generateId = (prefix = ''): string => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}${prefix ? '_' : ''}${timestamp}_${random}`
}

export const formatId = (id: string, maxLength = 8): string => {
  if (id.length <= maxLength) return id
  return `${id.substring(0, maxLength)}...`
}

// Formatação de URLs
export const formatUrl = (url: string): string => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

export const extractDomain = (url: string): string => {
  try {
    const domain = new URL(formatUrl(url)).hostname
    return domain.replace('www.', '')
  } catch {
    return url
  }
}

// Formatação de cores
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${[r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')}`
}