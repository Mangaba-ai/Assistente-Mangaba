import React from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  if (!isOpen) return null
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }
  
  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0"
        onClick={handleBackdropClick}
      >
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        
        <div className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full ${sizeClasses[size]}`}>
          {title && (
            <div className="border-b border-border px-6 py-4">
            <h3 className="text-lg font-medium leading-6 text-foreground">
                {title}
              </h3>
            </div>
          )}
          
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
  
  return createPortal(modalContent, document.body)
}

export default Modal