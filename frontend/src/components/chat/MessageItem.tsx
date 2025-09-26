import React from 'react'
import { Message } from '../../types/chat'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MessageItemProps {
  message: Message
  className?: string
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  className = ''
}) => {
  const isUser = message.role === 'user'

  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: ptBR 
    })
  }



  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${className}`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg flex flex-col ${
        isUser ? 'items-end' : 'items-start'
      }`}>
        {/* Avatar e nome */}
        <div className={`flex items-center mb-1 ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
            isUser 
              ? 'bg-blue-600 dark:bg-blue-700 ml-2' 
              : 'bg-gray-600 dark:bg-gray-700 mr-2'
          }`}>
            {isUser ? 'U' : 'A'}
          </div>
          <span className="text-xs text-gray-500 dark:text-white">
            {isUser ? 'Você' : 'Assistente'}
          </span>
        </div>

        {/* Mensagem */}
        <div className={`rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-600 dark:bg-blue-800 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          
          {/* Arquivos anexados */}
          {message.files && message.files.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.files.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center space-x-2 p-2 rounded ${
                    isUser
                      ? 'bg-blue-500/20 dark:bg-blue-700/30'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  <span className="text-xs truncate">{file.name}</span>
                  <span className="text-xs opacity-75">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-400 dark:text-white mt-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}

export default MessageItem