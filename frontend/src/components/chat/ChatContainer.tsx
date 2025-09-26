import React, { useState, useEffect } from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import ChatHeader from './ChatHeader'
import TypingIndicator from './TypingIndicator'
import { Message } from '../../types/chat'

interface ChatContainerProps {
  chatId?: string
  className?: string
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  chatId,
  className = ''
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (chatId) {
      loadMessages()
    }
  }, [chatId])

  const loadMessages = async () => {
    setIsLoading(true)
    try {
      // TODO: Implementar carregamento de mensagens da API
      // const response = await apiClient.get(`/chats/${chatId}/messages`)
      // setMessages(response.data)
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!content.trim() && !files?.length) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      files: files?.map(file => ({
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      }))
    }

    setMessages(prev => [...prev, newMessage])
    setIsTyping(true)

    try {
      // TODO: Implementar envio de mensagem para API
      // const response = await apiClient.post(`/chats/${chatId}/messages`, {
      //   content,
      //   files
      // })
      
      // Simular resposta do assistente
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Esta é uma resposta simulada do assistente.',
          role: 'assistant',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)
      }, 2000)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setIsTyping(false)
    }
  }

  return (
    <div className={`flex flex-col h-full bg-background dark:bg-background ${className}`}>
      <ChatHeader chatId={chatId} />
      
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList 
          messages={messages} 
          isLoading={isLoading}
          className="flex-1"
        />
        
        {isTyping && (
          <div className="px-4 py-2">
            <TypingIndicator />
          </div>
        )}
        
        <div className="border-t border-border">
          <MessageInput 
            onSendMessage={handleSendMessage}
            disabled={isTyping}
          />
        </div>
      </div>
    </div>
  )
}

export default ChatContainer