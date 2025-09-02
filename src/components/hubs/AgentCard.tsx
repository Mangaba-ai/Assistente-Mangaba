import React from 'react'
import { Agent } from '../../types/agent'
import Button from '../ui/Button'

interface AgentCardProps {
  agent: Agent
  onSelect?: (agent: Agent) => void
  onEdit?: (agent: Agent) => void
  onDelete?: (agent: Agent) => void
  isSelected?: boolean
  className?: string
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
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
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {agent.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {agent.ollamaModel || 'Modelo não definido'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button
                variant="ghost"
                onClick={() => onEdit(agent)}
                className="p-2"
                title="Editar agente"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="ghost"
                onClick={() => onDelete(agent)}
                className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                title="Excluir agente"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            )}
          </div>
        </div>
        
        {agent.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {agent.description}
          </p>
        )}
        
        {agent.systemPrompt && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Prompt do Sistema:
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 bg-gray-50 dark:bg-gray-700 p-2 rounded">
              {agent.systemPrompt}
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span className={`px-2 py-1 rounded-full ${
              agent.isActive 
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}>
              {agent.isActive ? 'Ativo' : 'Inativo'}
            </span>
            
            {agent.createdAt && (
              <span>
                Criado em {new Date(agent.createdAt).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
          
          {onSelect && (
            <Button
              onClick={() => onSelect(agent)}
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

export default AgentCard