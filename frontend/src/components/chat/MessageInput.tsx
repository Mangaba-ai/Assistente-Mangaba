import React, { useState, useRef } from 'react'
import Button from '../ui/Button'
import FileUpload from './FileUpload'

interface MessageInputProps {
  onSendMessage: (content: string, files?: File[]) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Digite sua mensagem...',
  className = ''
}) => {
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if ((!message.trim() && files.length === 0) || disabled) {
      return
    }

    onSendMessage(message, files)
    setMessage('')
    setFiles([])
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(prev => [...prev, ...selectedFiles])
  }

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className={`p-4 ${className}`}>
      {/* Arquivos selecionados */}
      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 bg-gray-100 dark:bg-card rounded-lg px-3 py-2"
            >
              <svg
                className="w-4 h-4 text-gray-500 dark:text-foreground"
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
              <span className="text-sm text-gray-700 dark:text-foreground truncate max-w-32">
                {file.name}
              </span>
              <button
                onClick={() => handleRemoveFile(index)}
                className="text-gray-400 dark:text-foreground hover:text-red-500 transition-colors"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-2 border border-gray-300 dark:border-border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            disabled={disabled}
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          
          <Button
            type="submit"
            disabled={(!message.trim() && files.length === 0) || disabled}
            className="px-4 py-2"
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </Button>
        </div>
      </form>
    </div>
  )
}

export default MessageInput