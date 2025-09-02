// Utilitários para manipulação de datas

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

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  
  if (seconds < 60) return 'agora'
  if (minutes < 60) return `${minutes}m atrás`
  if (hours < 24) return `${hours}h atrás`
  if (days < 7) return `${days}d atrás`
  if (weeks < 4) return `${weeks} semana${weeks > 1 ? 's' : ''} atrás`
  if (months < 12) return `${months} mês${months > 1 ? 'es' : ''} atrás`
  return `${years} ano${years > 1 ? 's' : ''} atrás`
}

// Manipulação de datas
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}

export const addMinutes = (date: Date, minutes: number): Date => {
  const result = new Date(date)
  result.setMinutes(result.getMinutes() + minutes)
  return result
}

export const startOfDay = (date: Date): Date => {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

export const endOfDay = (date: Date): Date => {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

export const startOfWeek = (date: Date): Date => {
  const result = new Date(date)
  const day = result.getDay()
  const diff = result.getDate() - day
  result.setDate(diff)
  return startOfDay(result)
}

export const endOfWeek = (date: Date): Date => {
  const result = startOfWeek(date)
  return endOfDay(addDays(result, 6))
}

export const startOfMonth = (date: Date): Date => {
  const result = new Date(date)
  result.setDate(1)
  return startOfDay(result)
}

export const endOfMonth = (date: Date): Date => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + 1, 0)
  return endOfDay(result)
}

// Comparação de datas
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return startOfDay(date1).getTime() === startOfDay(date2).getTime()
}

export const isSameWeek = (date1: Date, date2: Date): boolean => {
  return startOfWeek(date1).getTime() === startOfWeek(date2).getTime()
}

export const isSameMonth = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() && 
         date1.getMonth() === date2.getMonth()
}

export const isBefore = (date1: Date, date2: Date): boolean => {
  return date1.getTime() < date2.getTime()
}

export const isAfter = (date1: Date, date2: Date): boolean => {
  return date1.getTime() > date2.getTime()
}

export const isBetween = (date: Date, start: Date, end: Date): boolean => {
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime()
}

// Utilitários específicos
export const getWeekDays = (date: Date): Date[] => {
  const start = startOfWeek(date)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export const getMonthDays = (date: Date): Date[] => {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  const days: Date[] = []
  
  let current = new Date(start)
  while (current <= end) {
    days.push(new Date(current))
    current = addDays(current, 1)
  }
  
  return days
}

export const getDayName = (date: Date, format: 'short' | 'long' = 'long'): string => {
  return date.toLocaleDateString('pt-BR', { 
    weekday: format === 'short' ? 'short' : 'long' 
  })
}

export const getMonthName = (date: Date, format: 'short' | 'long' = 'long'): string => {
  return date.toLocaleDateString('pt-BR', { 
    month: format === 'short' ? 'short' : 'long' 
  })
}

// Parsing e validação
export const parseDate = (dateString: string): Date | null => {
  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

export const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime())
}

// Timezone
export const getTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export const convertToTimezone = (date: Date, timezone: string): Date => {
  return new Date(date.toLocaleString('en-US', { timeZone: timezone }))
}