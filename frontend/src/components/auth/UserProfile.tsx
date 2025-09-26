import React, { useState } from 'react'
import { User, Mail, Calendar, Crown, Settings, LogOut, Edit3, Save, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'

interface UserProfileProps {
  isOpen: boolean
  onClose: () => void
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user, logout, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  if (!isOpen || !user) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      await updateProfile({
        name: editData.name,
        email: editData.email
      })
      setIsEditing(false)
    } catch (error) {
      // Error is handled in the updateProfile function
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      name: user.name,
      email: user.email
    })
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'premium':
        return 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Perfil do Usuário
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Avatar and basic info */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            {/* Plan badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium mb-2 ${getPlanBadgeColor(user.subscription.plan)}`}>
              {user.subscription.plan === 'premium' ? (
                <div className="flex items-center space-x-1">
                  <Crown className="w-3 h-3" />
                  <span>Premium</span>
                </div>
              ) : (
                'Gratuito'
              )}
            </div>
          </div>

          {/* User details */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Nome
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-black rounded-lg">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{user.name}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{user.email}</span>
                </div>
              )}
            </div>

            {/* Member since */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Membro desde
              </label>
              <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-400 dark:text-white" />
                <span className="text-gray-900 dark:text-white">{formatDate(user.createdAt)}</span>
              </div>
            </div>

            {/* Last login */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Último acesso
              </label>
              <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white">{formatDate(user.lastLoginAt)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 space-y-3">
            {isEditing ? (
              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{isLoading ? 'Salvando...' : 'Salvar'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <Edit3 className="w-4 h-4" />
                <span>Editar Perfil</span>
              </button>
            )}

            {!isEditing && (
              <>
                <button
                  onClick={() => toast('Configurações em desenvolvimento')}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile