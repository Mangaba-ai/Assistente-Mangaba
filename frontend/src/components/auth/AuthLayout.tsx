import React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  className = ''
}) => {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          
          {title && (
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              {title}
            </h2>
          )}
          
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-lg rounded-lg">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout