import React from 'react'
import Button from '../ui/Button'

interface NotFoundProps {
  title?: string
  message?: string
  onGoBack?: () => void
  showBackButton?: boolean
}

export const NotFound: React.FC<NotFoundProps> = ({
  title = '404 - Página não encontrada',
  message = 'A página que você está procurando não existe.',
  onGoBack,
  showBackButton = true
}) => {
  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack()
    } else {
      window.history.back()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 dark:text-gray-700">404</h1>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>
        
        {showBackButton && (
          <Button onClick={handleGoBack}>
            Voltar
          </Button>
        )}
      </div>
    </div>
  )
}

export default NotFound