// Utilitários para funcionalidades de chat
import type { Message, Chat } from '../types'
import { formatRelativeTime } from './date'

// Agrupar mensagens por data
export const groupMessagesByDate = (messages: Message[]): Record<string, Message[]> => {
  const groups: Record<string, Message[]> = {}
  
  messages.forEach(message => {
    const date = new Date(message.timestamp)
    const dateKey = date.toDateString()
    
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    
    groups[dateKey].push(message)
  })
  
  return groups
}

// Agrupar chats por data
export const groupChatsByDate = (chats: Chat[]): Record<string, Chat[]> => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  const groups: Record<string, Chat[]> = {
    'Hoje': [],
    'Ontem': [],
    'Últimos 7 dias': [],
    'Últimos 30 dias': [],
    'Mais antigos': []
  }
  
  chats.forEach(chat => {
    const chatDate = new Date(chat.updatedAt)
    
    if (chatDate >= today) {
      groups['Hoje'].push(chat)
    } else if (chatDate >= yesterday) {
      groups['Ontem'].push(chat)
    } else if (chatDate >= lastWeek) {
      groups['Últimos 7 dias'].push(chat)
    } else if (chatDate >= lastMonth) {
      groups['Últimos 30 dias'].push(chat)
    } else {
      groups['Mais antigos'].push(chat)
    }
  })
  
  // Remover grupos vazios
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key]
    }
  })
  
  return groups
}

// Gerar título automático para chat baseado na primeira mensagem
export const generateChatTitle = (firstMessage: string, maxLength = 50): string => {
  if (!firstMessage || firstMessage.trim().length === 0) {
    return 'Nova conversa'
  }
  
  // Remover quebras de linha e espaços extras
  const cleaned = firstMessage.replace(/\s+/g, ' ').trim()
  
  // Truncar se necessário
  if (cleaned.length <= maxLength) {
    return cleaned
  }
  
  // Encontrar o último espaço antes do limite
  const truncated = cleaned.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + '...'
  }
  
  return truncated + '...'
}

// Extrair texto de uma mensagem (removendo markdown, etc.)
export const extractTextFromMessage = (content: string): string => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1') // Italic
    .replace(/`(.*?)`/g, '$1') // Inline code
    .replace(/```[\s\S]*?```/g, '[código]') // Code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/#{1,6}\s/g, '') // Headers
    .replace(/\n+/g, ' ') // Line breaks
    .trim()
}

// Contar palavras em uma mensagem
export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

// Contar caracteres (excluindo espaços)
export const countCharacters = (text: string): number => {
  return text.replace(/\s/g, '').length
}

// Estimar tempo de leitura
export const estimateReadingTime = (text: string, wordsPerMinute = 200): number => {
  const wordCount = countWords(text)
  return Math.ceil(wordCount / wordsPerMinute)
}

// Verificar se uma mensagem contém código
export const containsCode = (content: string): boolean => {
  return /```[\s\S]*?```|`[^`]+`/.test(content)
}

// Verificar se uma mensagem contém links
export const containsLinks = (content: string): boolean => {
  return /\[([^\]]+)\]\([^)]+\)|https?:\/\/[^\s]+/.test(content)
}

// Extrair links de uma mensagem
export const extractLinks = (content: string): string[] => {
  const links: string[] = []
  
  // Links em markdown
  const markdownLinks = content.match(/\[([^\]]+)\]\(([^)]+)\)/g)
  if (markdownLinks) {
    markdownLinks.forEach(link => {
      const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/)
      if (match) {
        links.push(match[2])
      }
    })
  }
  
  // URLs diretas
  const directUrls = content.match(/https?:\/\/[^\s]+/g)
  if (directUrls) {
    links.push(...directUrls)
  }
  
  return [...new Set(links)] // Remover duplicatas
}

// Formatar mensagem para exibição
export const formatMessageForDisplay = (message: Message): string => {
  let formatted = message.content
  
  // Adicionar timestamp se necessário
  if (message.timestamp) {
    const timeStr = formatRelativeTime(new Date(message.timestamp))
    formatted += ` (${timeStr})`
  }
  
  return formatted
}

// Buscar mensagens por texto
export const searchMessages = (messages: Message[], query: string): Message[] => {
  if (!query.trim()) return messages
  
  const searchTerm = query.toLowerCase().trim()
  
  return messages.filter(message => {
    const content = extractTextFromMessage(message.content).toLowerCase()
    return content.includes(searchTerm)
  })
}

// Filtrar mensagens por tipo
export const filterMessagesByRole = (messages: Message[], role: 'user' | 'assistant'): Message[] => {
  return messages.filter(message => message.role === role)
}

// Obter estatísticas de uma conversa
export const getChatStatistics = (messages: Message[]) => {
  const userMessages = filterMessagesByRole(messages, 'user')
  const assistantMessages = filterMessagesByRole(messages, 'assistant')
  
  const totalWords = messages.reduce((sum, msg) => sum + countWords(msg.content), 0)
  const totalCharacters = messages.reduce((sum, msg) => sum + countCharacters(msg.content), 0)
  
  const messagesWithCode = messages.filter(msg => containsCode(msg.content))
  const messagesWithLinks = messages.filter(msg => containsLinks(msg.content))
  
  return {
    totalMessages: messages.length,
    userMessages: userMessages.length,
    assistantMessages: assistantMessages.length,
    totalWords,
    totalCharacters,
    averageWordsPerMessage: Math.round(totalWords / messages.length) || 0,
    messagesWithCode: messagesWithCode.length,
    messagesWithLinks: messagesWithLinks.length,
    estimatedReadingTime: estimateReadingTime(messages.map(m => m.content).join(' '))
  }
}

// Exportar conversa como texto
export const exportChatAsText = (chat: Chat, messages: Message[]): string => {
  const header = `# ${chat.title}\n\nCriado em: ${new Date(chat.createdAt).toLocaleString('pt-BR')}\nÚltima atualização: ${new Date(chat.updatedAt).toLocaleString('pt-BR')}\n\n---\n\n`
  
  const content = messages.map(message => {
    const timestamp = new Date(message.timestamp).toLocaleString('pt-BR')
    const role = message.role === 'user' ? 'Usuário' : 'Assistente'
    return `**${role}** (${timestamp}):\n${message.content}\n`
  }).join('\n')
  
  return header + content
}

// Exportar conversa como JSON
export const exportChatAsJSON = (chat: Chat, messages: Message[]): string => {
  return JSON.stringify({
    chat,
    messages,
    exportedAt: new Date().toISOString(),
    statistics: getChatStatistics(messages)
  }, null, 2)
}