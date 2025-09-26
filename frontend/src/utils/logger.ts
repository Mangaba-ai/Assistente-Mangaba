export interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'debug'
  category: 'message' | 'system' | 'user' | 'agent' | 'hub' | 'error'
  message: string
  data?: any
  userId?: string
  chatId?: string
  hubId?: string
  agentId?: string
}

export interface LogFilter {
  level?: LogEntry['level'][]
  category?: LogEntry['category'][]
  startDate?: Date
  endDate?: Date
  userId?: string
  chatId?: string
  hubId?: string
  agentId?: string
  search?: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000
  private isEnabled = true

  constructor() {
    this.loadLogs()
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private loadLogs(): void {
    try {
      const savedLogs = localStorage.getItem('mangaba-logs')
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }))
      }
    } catch (error) {
      console.warn('Failed to load logs from localStorage:', error)
    }
  }

  private saveLogs(): void {
    try {
      localStorage.setItem('mangaba-logs', JSON.stringify(this.logs))
    } catch (error) {
      console.warn('Failed to save logs to localStorage:', error)
    }
  }

  private addLog(entry: Omit<LogEntry, 'id' | 'timestamp'>): void {
    if (!this.isEnabled) return

    const logEntry: LogEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date()
    }

    this.logs.unshift(logEntry)

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    this.saveLogs()

    // Also log to console in development
    if (import.meta.env.DEV) {
      const consoleMethod = entry.level === 'error' ? 'error' : 
                           entry.level === 'warn' ? 'warn' : 'log'
      console[consoleMethod](`[${entry.category}] ${entry.message}`, entry.data || '')
    }
  }

  info(message: string, data?: any, context?: Partial<LogEntry>): void {
    this.addLog({
      level: 'info',
      category: 'system',
      message,
      data,
      ...context
    })
  }

  warn(message: string, data?: any, context?: Partial<LogEntry>): void {
    this.addLog({
      level: 'warn',
      category: 'system',
      message,
      data,
      ...context
    })
  }

  error(message: string, error?: any, context?: Partial<LogEntry>): void {
    this.addLog({
      level: 'error',
      category: 'error',
      message,
      data: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      ...context
    })
  }

  debug(message: string, data?: any, context?: Partial<LogEntry>): void {
    this.addLog({
      level: 'debug',
      category: 'system',
      message,
      data,
      ...context
    })
  }

  logMessage(type: 'sent' | 'received', content: string, context: {
    chatId: string
    hubId?: string
    agentId?: string
    userId?: string
  }): void {
    this.addLog({
      level: 'info',
      category: 'message',
      message: `Message ${type}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
      data: { content, type },
      ...context
    })
  }

  logUserAction(action: string, data?: any, context?: Partial<LogEntry>): void {
    this.addLog({
      level: 'info',
      category: 'user',
      message: `User action: ${action}`,
      data,
      ...context
    })
  }

  logAgentAction(action: string, data?: any, context?: Partial<LogEntry>): void {
    this.addLog({
      level: 'info',
      category: 'agent',
      message: `Agent action: ${action}`,
      data,
      ...context
    })
  }

  logHubAction(action: string, data?: any, context?: Partial<LogEntry>): void {
    this.addLog({
      level: 'info',
      category: 'hub',
      message: `Hub action: ${action}`,
      data,
      ...context
    })
  }

  getLogs(filter?: LogFilter): LogEntry[] {
    let filteredLogs = [...this.logs]

    if (filter) {
      if (filter.level && filter.level.length > 0) {
        filteredLogs = filteredLogs.filter(log => filter.level!.includes(log.level))
      }

      if (filter.category && filter.category.length > 0) {
        filteredLogs = filteredLogs.filter(log => filter.category!.includes(log.category))
      }

      if (filter.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.startDate!)
      }

      if (filter.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filter.endDate!)
      }

      if (filter.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filter.userId)
      }

      if (filter.chatId) {
        filteredLogs = filteredLogs.filter(log => log.chatId === filter.chatId)
      }

      if (filter.hubId) {
        filteredLogs = filteredLogs.filter(log => log.hubId === filter.hubId)
      }

      if (filter.agentId) {
        filteredLogs = filteredLogs.filter(log => log.agentId === filter.agentId)
      }

      if (filter.search) {
        const searchLower = filter.search.toLowerCase()
        filteredLogs = filteredLogs.filter(log => 
          log.message.toLowerCase().includes(searchLower) ||
          (log.data && JSON.stringify(log.data).toLowerCase().includes(searchLower))
        )
      }
    }

    return filteredLogs
  }

  clearLogs(): void {
    this.logs = []
    this.saveLogs()
    this.info('Logs cleared')
  }

  exportLogs(filter?: LogFilter): string {
    const logs = this.getLogs(filter)
    return JSON.stringify(logs, null, 2)
  }

  getLogStats(): {
    total: number
    byLevel: Record<LogEntry['level'], number>
    byCategory: Record<LogEntry['category'], number>
    oldestLog?: Date
    newestLog?: Date
  } {
    const stats = {
      total: this.logs.length,
      byLevel: {
        info: 0,
        warn: 0,
        error: 0,
        debug: 0
      },
      byCategory: {
        message: 0,
        system: 0,
        user: 0,
        agent: 0,
        hub: 0,
        error: 0
      },
      oldestLog: this.logs.length > 0 ? this.logs[this.logs.length - 1].timestamp : undefined,
      newestLog: this.logs.length > 0 ? this.logs[0].timestamp : undefined
    }

    this.logs.forEach(log => {
      stats.byLevel[log.level]++
      stats.byCategory[log.category]++
    })

    return stats
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    this.info(`Logging ${enabled ? 'enabled' : 'disabled'}`)
  }

  setMaxLogs(maxLogs: number): void {
    this.maxLogs = maxLogs
    if (this.logs.length > maxLogs) {
      this.logs = this.logs.slice(0, maxLogs)
      this.saveLogs()
    }
    this.info(`Max logs set to ${maxLogs}`)
  }
}

// Create singleton instance
export const logger = new Logger()

// Export convenience functions
export const logInfo = (message: string, data?: any, context?: Partial<LogEntry>) => 
  logger.info(message, data, context)

export const logWarn = (message: string, data?: any, context?: Partial<LogEntry>) => 
  logger.warn(message, data, context)

export const logError = (message: string, error?: any, context?: Partial<LogEntry>) => 
  logger.error(message, error, context)

export const logDebug = (message: string, data?: any, context?: Partial<LogEntry>) => 
  logger.debug(message, data, context)

export const logMessage = (type: 'sent' | 'received', content: string, context: {
  chatId: string
  hubId?: string
  agentId?: string
  userId?: string
}) => logger.logMessage(type, content, context)

export const logUserAction = (action: string, data?: any, context?: Partial<LogEntry>) => 
  logger.logUserAction(action, data, context)

export const logAgentAction = (action: string, data?: any, context?: Partial<LogEntry>) => 
  logger.logAgentAction(action, data, context)

export const logHubAction = (action: string, data?: any, context?: Partial<LogEntry>) => 
  logger.logHubAction(action, data, context)