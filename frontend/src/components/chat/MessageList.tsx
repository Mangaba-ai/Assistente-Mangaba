import React, { useEffect, useRef } from 'react'
import MessageItem from './MessageItem'
import { Message } from '../../types/chat'
import LoadingScreen from '../system/LoadingScreen'

interface MessageListProps {
  messages: Message[]
  isLoading?: boolean
  className?: string
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  className = ''
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (isLoading && messages.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <LoadingScreen />
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500 dark:text-white">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 dark:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhuma mensagem ainda</h3>
          <p className="text-sm">Comece uma conversa enviando uma mensagem.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col space-y-4 p-4 overflow-y-auto ${className}`}>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList