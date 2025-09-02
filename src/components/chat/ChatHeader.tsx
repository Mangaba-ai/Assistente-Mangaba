import React from 'react'
import Button from '../ui/Button'

interface ChatHeaderProps {
  chatId?: string
  title?: string
  subtitle?: string
  onSettingsClick?: () => void
  onClearChat?: () => void
  className?: string
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title = 'Chat',
  subtitle,
  onSettingsClick,
  onClearChat,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between p-4 border-b border-border bg-background ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-700 flex items-center justify-center text-foreground font-medium relative">
          {/* Indicador de status online */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full border-2 border-background dark:border-background"></div>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {onClearChat && (
          <Button
            variant="ghost"
            onClick={onClearChat}
            className="p-2"
            title="Limpar chat"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </Button>
        )}
        
        {onSettingsClick && (
          <Button
            variant="ghost"
            onClick={onSettingsClick}
            className="p-2"
            title="Configurações"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </Button>
        )}
      </div>
    </div>
  )
}

export default ChatHeader