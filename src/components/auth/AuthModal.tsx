import React, { useState } from 'react'
import { X } from 'lucide-react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" />
        
        {/* Modal positioning */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        
        {/* Modal content */}
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-900 shadow-xl rounded-2xl sm:max-w-lg">
          {/* Close button */}
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Form content */}
          <div className="mt-4">
            {mode === 'login' ? (
              <LoginForm 
                onSwitchToRegister={() => setMode('register')}
                onClose={onClose}
              />
            ) : (
              <RegisterForm 
                onSwitchToLogin={() => setMode('login')}
                onClose={onClose}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal