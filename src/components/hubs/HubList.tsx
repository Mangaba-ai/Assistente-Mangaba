import React from 'react'
import { Hub } from '../../types/hub'
import HubCard from './HubCard'
import Button from '../ui/Button'

interface HubListProps {
  hubs: Hub[]
  onSelectHub?: (hub: Hub) => void
  onEditHub?: (hub: Hub) => void
  onDeleteHub?: (hub: Hub) => void
  onCreateHub?: () => void
  selectedHubId?: string
  isLoading?: boolean
  className?: string
}

export const HubList: React.FC<HubListProps> = ({
  hubs,
  onSelectHub,
  onEditHub,
  onDeleteHub,
  onCreateHub,
  selectedHubId,
  isLoading = false,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                <div>
                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (hubs.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-400 dark:text-gray-600"
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Nenhum hub encontrado
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Crie seu primeiro hub para começar a organizar seus agentes.
        </p>
        {onCreateHub && (
          <Button onClick={onCreateHub} variant="primary">
            Criar Primeiro Hub
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Meus Hubs
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {hubs.length} hub{hubs.length !== 1 ? 's' : ''} encontrado{hubs.length !== 1 ? 's' : ''}
          </p>
        </div>
        {onCreateHub && (
          <Button onClick={onCreateHub} variant="primary">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Hub
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {hubs.map((hub) => (
          <HubCard
            key={hub.id}
            hub={hub}
            onSelect={onSelectHub}
            onEdit={onEditHub}
            onDelete={onDeleteHub}
            isSelected={selectedHubId === hub.id}
          />
        ))}
      </div>
    </div>
  )
}

export default HubList