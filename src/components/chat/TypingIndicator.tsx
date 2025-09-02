import React from 'react'

interface TypingIndicatorProps {
  className?: string
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1 bg-warning-subtle rounded-lg px-4 py-2 border border-warning/20">
        <div className="w-8 h-8 rounded-full bg-warning flex items-center justify-center text-warning-foreground text-sm font-medium mr-2">
          A
        </div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-warning rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-warning rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-warning rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator