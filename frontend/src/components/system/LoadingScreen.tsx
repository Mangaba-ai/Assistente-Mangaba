import React from 'react'
import Spinner from '../ui/Spinner'

interface LoadingScreenProps {
  message?: string
  fullScreen?: boolean
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Carregando...',
  fullScreen = true
}) => {
  const containerClass = fullScreen
    ? 'fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50'
    : 'flex items-center justify-center p-8'

  return (
    <div className={containerClass}>
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  )
}

export default LoadingScreen