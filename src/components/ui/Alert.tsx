import React from 'react'

interface AlertProps {
  children: React.ReactNode
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  onClose?: () => void
  className?: string
}

const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  onClose,
  className = ''
}) => {
  const variantClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200',
    success: 'bg-success-subtle border-success text-success dark:bg-success-subtle dark:border-success dark:text-success',
    warning: 'bg-warning-subtle border-warning text-warning dark:bg-warning-subtle dark:border-warning dark:text-warning',
    error: 'bg-error-subtle border-error text-error dark:bg-error-subtle dark:border-error dark:text-error'
  }
  
  const iconClasses = {
    info: 'text-blue-400 dark:text-blue-300',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error'
  }
  
  const alertClasses = `border rounded-md p-4 ${variantClasses[variant]} ${className}`
  
  return (
    <div className={alertClasses}>
      <div className="flex">
        <div className="flex-shrink-0">
          <div className={`h-5 w-5 ${iconClasses[variant]}`}>
            {variant === 'success' && '✓'}
            {variant === 'warning' && '⚠'}
            {variant === 'error' && '✕'}
            {variant === 'info' && 'ℹ'}
          </div>
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Alert