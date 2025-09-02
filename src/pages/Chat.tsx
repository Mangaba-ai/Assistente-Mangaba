import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Paperclip,
  Mic,
  Square,
  Copy,
  ThumbsUp,
  ThumbsDown,
  User,
  Bot,
  Sparkles,
  Image,
  File,
  X
} from 'lucide-react'
import { useChatStore, Message } from '../stores/chatStore'
import { cn } from '../utils/cn'
import toast from 'react-hot-toast'
import { logMessage, logUserAction, logError } from '../utils/logger'
import useChatOllama from '../hooks/useChatOllama'

const Chat = () => {
  const {
    getCurrentChat,
    addMessage,
    createChat,
    currentChatId,
    isTyping,
    setTyping,
    getSelectedHub,
    getSelectedAgent,
    incrementHubUsage,
    incrementAgentUsage
  } = useChatStore()
  
  const { isGenerating } = useChatOllama()
  
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const currentChat = getCurrentChat()
  const selectedHub = getSelectedHub()
  const selectedAgent = getSelectedAgent()
  
  // Debug logs
  console.log('Chat component rendered')
  console.log('Current chat ID:', currentChatId)
  console.log('Current chat:', getCurrentChat())
  console.log('Selected hub:', selectedHub)
  console.log('Selected agent:', selectedAgent)
  
  // Use Ollama generating state for typing indicator
  const typing = isTyping || isGenerating
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [currentChat?.messages])
  
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
    }
  }
  
  useEffect(() => {
    adjustTextareaHeight()
  }, [message])
  
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    
    logUserAction('file_upload_attempt', {
      fileCount: files.length,
      fileNames: Array.from(files).map(f => f.name),
      fileSizes: Array.from(files).map(f => f.size)
    })
    
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/') || 
                         file.type === 'application/pdf' ||
                         file.type.startsWith('text/') ||
                         file.type === 'application/json'
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      
      if (!isValidType) {
        const errorMsg = `Tipo de arquivo não suportado: ${file.name}`
        toast.error(errorMsg)
        logError(errorMsg, { fileName: file.name, fileType: file.type })
        return false
      }
      if (!isValidSize) {
        const errorMsg = `Arquivo muito grande: ${file.name} (máximo 10MB)`
        toast.error(errorMsg)
        logError(errorMsg, { fileName: file.name, fileSize: file.size })
        return false
      }
      return true
    })
    
    validFiles.forEach(file => {
      logUserAction('file_uploaded', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      })
    })
    
    setAttachedFiles(prev => [...prev, ...validFiles])
  }
  
  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }
  

  

  
  const handleSendMessage = async () => {
    if ((!message.trim() && attachedFiles.length === 0) || typing) return
    
    let chatId = currentChatId
    if (!chatId) {
      chatId = await createChat(selectedHub?.id, selectedAgent?.id)
    }
    
    const userMessage = message.trim()
    const files = [...attachedFiles]
    setMessage('')
    setAttachedFiles([])
    
    // Create message content with files
    let messageContent = userMessage
    if (files.length > 0) {
      const fileList = files.map(f => `📎 ${f.name}`).join('\n')
      messageContent = userMessage ? `${userMessage}\n\n${fileList}` : fileList
    }
    
    // Add user message
    addMessage(chatId, {
      content: messageContent,
      role: 'user',
      hubId: selectedHub?.id,
      agentId: selectedAgent?.id
    })
    
    // Log user message
    logMessage('sent', userMessage, {
      chatId,
      hubId: selectedHub?.id,
      agentId: selectedAgent?.id,
      userId: 'current-user' // TODO: Replace with actual user ID when auth is implemented
    })
    
    // Log user action
    logUserAction('send_message', {
      messageLength: userMessage.length,
      hasFiles: files.length > 0,
      fileCount: files.length,
      hubName: selectedHub?.name,
      agentName: selectedAgent?.name
    }, {
      chatId,
      hubId: selectedHub?.id,
      agentId: selectedAgent?.id
    })
    
    // Track usage
    if (selectedHub) {
      incrementHubUsage(selectedHub.id)
    }
    if (selectedAgent && selectedHub) {
      incrementAgentUsage(selectedHub.id, selectedAgent.id)
    }
    
    // Send message to backend API
    setTyping(true)
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const token = localStorage.getItem('token')
      
      // Send message to backend chat API
      const response = await fetch(`${API_URL}/chat/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: messageContent,
          role: 'user',
          attachments: files.map(f => ({
            type: f.type.startsWith('image/') ? 'image' : 'file',
            name: f.name,
            size: f.size
          }))
        })
      })
      
      if (!response.ok) {
        throw new Error('Falha ao enviar mensagem')
      }
      
      await response.json()
      
      // Fetch updated chat to get AI response
      const chatResponse = await fetch(`${API_URL}/chat/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (chatResponse.ok) {
        const chatData = await chatResponse.json()
        const messages = chatData.data.messages
        
        // Find the latest assistant message
        const latestAssistantMessage = messages
          .filter((msg: Message) => msg.role === 'assistant')
          .sort((a: Message, b: Message) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
        
        if (latestAssistantMessage) {
          addMessage(chatId, {
            content: latestAssistantMessage.content,
            role: 'assistant',
            hubId: selectedHub?.id,
            agentId: selectedAgent?.id
          })
          
          // Log AI response
          logMessage('received', latestAssistantMessage.content, {
            chatId,
            hubId: selectedHub?.id,
            agentId: selectedAgent?.id,
            userId: 'current-user'
          })
        }
      }
    } catch (error) {
      const errorMessage = 'Erro ao gerar resposta com Ollama'
      toast.error(errorMessage)
      logError(errorMessage, error, {
        category: 'error',
        chatId,
        hubId: selectedHub?.id,
        agentId: selectedAgent?.id
      })
    } finally {
      setTyping(false)
    }
  }
  

  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileUpload(e.dataTransfer.files)
  }
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Mensagem copiada!')
  }
  
  const examplePrompts = [
    'Explique como funciona a inteligência artificial',
    'Ajude-me a escrever um e-mail profissional',
    'Crie uma receita com ingredientes que tenho em casa',
    'Explique um conceito científico complexo de forma simples'
  ]
  
  if (!currentChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">
            Olá! Eu sou o Mangaba Assistente
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Como posso ajudá-lo hoje? Digite sua pergunta abaixo e vamos conversar!
          </p>
          
          {selectedHub && (
            <div className="mb-8 p-4 bg-gradient-to-r from-green-50/70 to-yellow-50/70 dark:bg-black border border-green-200/60 dark:border-white rounded-lg shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Contexto Ativo</div>
              <div className="font-medium text-foreground">{selectedHub.name}</div>
              {selectedAgent && (
                <div className="text-sm text-muted-foreground">{selectedAgent.name}</div>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setMessage(prompt)}
                className="p-4 text-left border border-green-200/60 dark:border-white rounded-lg hover:bg-gradient-to-r hover:from-green-50/70 hover:to-yellow-50/70 dark:hover:bg-white dark:hover:text-black transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="text-sm font-medium mb-1">{prompt}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div 
      className={`flex flex-col h-screen bg-background transition-colors ${
        dragOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {dragOver && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-yellow-500/15 to-red-500/20 dark:bg-black/80 border-2 border-dashed border-green-500 dark:border-white rounded-lg flex items-center justify-center z-50">
          <div className="text-center">
            <Paperclip className="w-12 h-12 text-green-500 dark:text-green-300 mx-auto mb-2" />
            <p className="text-lg font-medium text-green-600 dark:text-green-200">
              Solte os arquivos aqui
            </p>
            <p className="text-sm text-muted-foreground">
              Imagens, PDFs, textos (máx. 10MB)
            </p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0 bg-gradient-to-r from-green-50/50 via-yellow-50/40 to-red-50/50 dark:bg-black">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 dark:from-green-400 dark:via-yellow-400 dark:to-red-400 rounded-full flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {selectedAgent?.name || 'Assistente'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {selectedAgent?.description || 'Pronto para ajudar'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
        <AnimatePresence>
          {currentChat.messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "flex gap-2 sm:gap-4",
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot size={14} className="sm:w-4 sm:h-4 text-white" />
                </div>
              )}
              
              <div className={cn(
                "max-w-[85%] sm:max-w-[70%] rounded-lg p-3 sm:p-4 relative group",
                msg.role === 'user'
                  ? "bg-gradient-to-r from-red-500 to-red-600 dark:bg-white dark:text-black text-white shadow-sm"
                  : "bg-gradient-to-r from-green-50 to-yellow-50 dark:bg-black border border-green-200/60 dark:border-white text-foreground"
              )}>
                <div className="whitespace-pre-wrap text-sm sm:text-base break-words">{msg.content}</div>
                
                {/* Message Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyMessage(msg.content)}
                      className="p-1 rounded hover:bg-background/20 transition-colors"
                      title="Copiar"
                    >
                      <Copy size={14} />
                    </button>
                    
                    {msg.role === 'assistant' && (
                      <>
                        <button
                          className="p-1 rounded hover:bg-background/20 transition-colors"
                          title="Gostei"
                        >
                          <ThumbsUp size={14} />
                        </button>
                        <button
                          className="p-1 rounded hover:bg-background/20 transition-colors"
                          title="Não gostei"
                        >
                          <ThumbsDown size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {msg.role === 'user' && (
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-400 dark:to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <User size={14} className="sm:w-4 sm:h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        {typing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-gradient-to-r from-green-50 to-yellow-50 dark:bg-black border border-green-200/60 dark:border-white rounded-lg p-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="border-t border-border p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          {/* File attachments preview */}
          {attachedFiles.length > 0 && (
            <div className="mb-4 p-3 bg-accent/50 dark:bg-black rounded-lg">
              <div className="text-sm font-medium mb-2">Arquivos anexados:</div>
              <div className="space-y-2">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-background dark:bg-black rounded border dark:border-white">
                    <div className="flex items-center gap-2">
                      {file.type.startsWith('image/') ? (
                        <Image size={16} className="text-blue-500" />
                      ) : (
                        <File size={16} className="text-foreground" />
                      )}
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-end gap-2 sm:gap-3 bg-gradient-to-r from-yellow-50/70 via-green-50/50 to-red-50/70 dark:bg-black border border-yellow-200/60 dark:border-white rounded-lg p-2 sm:p-3 shadow-sm">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.txt,.json"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-accent transition-colors"
              title="Anexar arquivo"
            >
              <Paperclip size={16} className="sm:w-[18px] sm:h-[18px] text-muted-foreground" />
            </button>
            
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem aqui..."
              className="flex-1 resize-none bg-transparent border-none outline-none min-h-[20px] sm:min-h-[24px] max-h-[150px] sm:max-h-[200px] text-sm sm:text-base"
              rows={1}
            />
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={cn(
                  "p-1.5 sm:p-2 rounded-lg transition-colors",
                  isRecording
                    ? "bg-destructive text-destructive-foreground"
                    : "hover:bg-accent"
                )}
              >
                {isRecording ? <Square size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Mic size={16} className="sm:w-[18px] sm:h-[18px] text-muted-foreground" />}
              </button>
              
              <button
               onClick={handleSendMessage}
               disabled={(!message.trim() && attachedFiles.length === 0) || typing}
               className={cn(
                 "p-1.5 sm:p-2 rounded-lg transition-colors",
                 (message.trim() || attachedFiles.length > 0) && !typing
                   ? "bg-primary text-primary-foreground hover:bg-primary/90"
                   : "bg-muted text-muted-foreground cursor-not-allowed"
               )}
             >
               <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
             </button>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground text-center mt-2">
            Mangaba Assistente pode cometer erros. Considere verificar informações importantes.
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat