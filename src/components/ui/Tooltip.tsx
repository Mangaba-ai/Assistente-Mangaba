import React, { useState } from 'react'

interface TooltipProps {
  children: React.ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false)
  
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }
  
  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-10 px-2 py-1 text-sm text-white bg-gray-900 rounded whitespace-nowrap ${positionClasses[position]}`}>
          {content}
        </div>
      )}
    </div>
  )
}

export default Tooltip