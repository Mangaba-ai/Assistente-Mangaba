import React from 'react'
import { Hub } from '../../types/hub'
import Button from '../ui/Button'

interface HubCardProps {
  hub: Hub
  onSelect?: (hub: Hub) => void
  onEdit?: (hub: Hub) => void
  onDelete?: (hub: Hub) => void
  isSelected?: boolean
  className?: string
}

export const HubCard: React.FC<HubCardProps> = ({
  hub,
  onSelect,
  onEdit,
  onDelete,
  isSelected = false,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-all hover:shadow-lg ${
      isSelected 
        ? 'border-blue-500 shadow-lg' 
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
    } ${className}`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {hub.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {hub.agents?.length || 0} agentes
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button
                variant="ghost"
                onClick={() => onEdit(hub)}
                className="p-2"
                title="Editar hub"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="ghost"
                onClick={() => onDelete(hub)}
                className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                title="Excluir hub"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            )}
          </div>
        </div>
        
        {hub.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {hub.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span className={`px-2 py-1 rounded-full ${
              hub.isActive 
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}>
              {hub.isActive ? 'Ativo' : 'Inativo'}
            </span>
            
            {hub.createdAt && (
              <span>
                Criado em {new Date(hub.createdAt).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
          
          {onSelect && (
            <Button
              onClick={() => onSelect(hub)}
              variant={isSelected ? 'primary' : 'outline'}
              className="text-sm"
            >
              {isSelected ? 'Selecionado' : 'Selecionar'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default HubCard