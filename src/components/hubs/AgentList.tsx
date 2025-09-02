import React from 'react'
import { Agent } from '../../types/agent'
import AgentCard from './AgentCard'
import Button from '../ui/Button'

interface AgentListProps {
  agents: Agent[]
  onSelectAgent?: (agent: Agent) => void
  onEditAgent?: (agent: Agent) => void
  onDeleteAgent?: (agent: Agent) => void
  onCreateAgent?: () => void
  selectedAgentId?: string
  isLoading?: boolean
  className?: string
}

export const AgentList: React.FC<AgentListProps> = ({
  agents,
  onSelectAgent,
  onEditAgent,
  onDeleteAgent,
  onCreateAgent,
  selectedAgentId,
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

  if (agents.length === 0) {
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Nenhum agente encontrado
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Crie seu primeiro agente para começar a conversar.
        </p>
        {onCreateAgent && (
          <Button onClick={onCreateAgent} variant="primary">
            Criar Primeiro Agente
          </Button>
        )}
      </div>
    )
  }

  const activeAgents = agents.filter(agent => agent.isActive)
  const inactiveAgents = agents.filter(agent => !agent.isActive)

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Agentes
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {agents.length} agente{agents.length !== 1 ? 's' : ''} encontrado{agents.length !== 1 ? 's' : ''}
            {activeAgents.length > 0 && (
              <span className="ml-2">
                • {activeAgents.length} ativo{activeAgents.length !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        {onCreateAgent && (
          <Button onClick={onCreateAgent} variant="primary">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Agente
          </Button>
        )}
      </div>

      {/* Agentes Ativos */}
      {activeAgents.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Agentes Ativos
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onSelect={onSelectAgent}
                onEdit={onEditAgent}
                onDelete={onDeleteAgent}
                isSelected={selectedAgentId === agent.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Agentes Inativos */}
      {inactiveAgents.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-4">
            Agentes Inativos ({inactiveAgents.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inactiveAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onSelect={onSelectAgent}
                onEdit={onEditAgent}
                onDelete={onDeleteAgent}
                isSelected={selectedAgentId === agent.id}
                className="opacity-75"
              />
            ))}
          </div>
        </div>
      )}

      {/* Estatísticas */}
      {agents.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {agents.length}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Total de Agentes
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {activeAgents.length}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Agentes Ativos
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {new Set(agents.map(agent => agent.ollamaModel)).size}
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Modelos Únicos
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentList