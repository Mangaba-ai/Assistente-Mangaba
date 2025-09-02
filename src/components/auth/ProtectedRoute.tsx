import React, { ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  requirePremium?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback,
  requireAuth = true,
  requireAdmin = false,
  requirePremium = false
}) => {
  const { user, isLoading, isAuthenticated } = useAuth()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600 dark:text-white">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Acesso Restrito
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Você precisa estar logado para acessar esta página.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>
    )
  }

  // Check admin requirement
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Acesso Negado
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    )
  }

  // Check premium requirement
  if (requirePremium && user?.subscription?.plan !== 'premium') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Upgrade Necessário
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Esta funcionalidade está disponível apenas para usuários Premium.
          </p>
          <button 
            onClick={() => console.log('Redirect to upgrade page')}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
          >
            Fazer Upgrade
          </button>
        </div>
      </div>
    )
  }

  // If all checks pass, render the protected content
  return <>{children}</>
}

export default ProtectedRoute