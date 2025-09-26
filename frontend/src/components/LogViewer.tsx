import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bug, 
  Download, 
  Filter, 
  Search, 
  Trash2, 
  X,
  MessageSquare,
  AlertTriangle,
  Info,
  Clock
} from 'lucide-react'
import { logger, LogEntry, LogFilter } from '../utils/logger'
import { cn } from '../utils/cn'

interface LogViewerProps {
  isOpen: boolean
  onClose: () => void
}

const LogViewer: React.FC<LogViewerProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [filter] = useState<LogFilter>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      const allLogs = logger.getLogs(filter)
      setLogs(allLogs)
      setFilteredLogs(allLogs)
    }
  }, [isOpen, filter])

  useEffect(() => {
    let filtered = logs

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(log => log.category === selectedCategory)
    }

    if (selectedLevel) {
      filtered = filtered.filter(log => log.level === selectedLevel)
    }

    setFilteredLogs(filtered)
  }, [logs, searchTerm, selectedCategory, selectedLevel])

  const handleClearLogs = () => {
    logger.clearLogs()
    setLogs([])
    setFilteredLogs([])
  }

  const handleExportLogs = () => {
    const exported = logger.exportLogs()
    const blob = new Blob([exported], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-gray-600" />
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
      case 'info':
        return <Info className="w-4 h-4 text-gray-400" />
      case 'debug':
        return <Bug className="w-4 h-4 text-gray-500" />
      default:
        return <MessageSquare className="w-4 h-4 text-gray-400" />
    }
  }

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'border-l-gray-600 bg-gray-100 dark:bg-gray-800/50'
      case 'warn':
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20'
      case 'info':
        return 'border-l-gray-400 bg-gray-50 dark:bg-gray-900/20'
      case 'debug':
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20'
      default:
        return 'border-l-gray-300 bg-gray-50 dark:bg-gray-800'
    }
  }

  const categories = [...new Set(logs.map(log => log.category).filter(Boolean))]
  const levels = [...new Set(logs.map(log => log.level))]

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Log Viewer
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({filteredLogs.length} entradas)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportLogs}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearLogs}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>

                {/* Filter dropdowns */}
                <div className="flex gap-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>

                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="">Todos os níveis</option>
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logs List */}
        <div className="flex-1 overflow-auto p-4">
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <Bug className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum log encontrado</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "border-l-4 p-3 rounded-r-lg",
                    getLogColor(log.level)
                  )}
                >
                  <div className="flex items-start gap-3">
                    {getLogIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {log.level.toUpperCase()}
                        </span>
                        {log.category && (
                          <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            {log.category}
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 ml-auto">
                          <Clock className="w-3 h-3" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {log.message}
                      </p>
                      {log.data && Object.keys(log.data).length > 0 && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                            Dados adicionais
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-gray-800 dark:text-gray-200 overflow-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default LogViewer