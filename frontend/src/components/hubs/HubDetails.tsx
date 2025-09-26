import React, { useState } from 'react'
import { Hub } from '../../types/hub'
import { Agent } from '../../types/agent'
import Button from '../ui/Button'
import AgentCard from './AgentCard'

interface HubDetailsProps {
  hub: Hub
  agents?: Agent[]
  onEditHub?: (hub: Hub) => void
  onDeleteHub?: (hub: Hub) => void
  onCreateAgent?: (hubId: string) => void
  onEditAgent?: (agent: Agent) => void
  onDeleteAgent?: (agent: Agent) => void
  onBack?: () => void
  className?: string
}

export const HubDetails: React.FC<HubDetailsProps> = ({
  hub,
  agents = [],
  onEditHub,
  onDeleteHub,
  onCreateAgent,
  onEditAgent,
  onDeleteAgent,
  onBack,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'settings'>('overview')

  const handleDeleteHub = () => {
    if (window.confirm('Tem certeza que deseja excluir este hub? Esta ação não pode ser desfeita.')) {
      onDeleteHub?.(hub)
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {onBack && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="p-2"
                title="Voltar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
            )}
            
            <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {hub.name}
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  hub.isActive 
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}>
                  {hub.isActive ? 'Ativo' : 'Inativo'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {agents.length} agente{agents.length !== 1 ? 's' : ''}
                </span>
                {hub.createdAt && (
                  <span className="text-sm text-muted-foreground">
                    Criado em {new Date(hub.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onEditHub && (
              <Button
                variant="outline"
                onClick={() => onEditHub(hub)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </Button>
            )}
            
            {onDeleteHub && (
              <Button
                variant="danger"
                onClick={handleDeleteHub}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Excluir
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'agents', label: 'Agentes' },
            { id: 'settings', label: 'Configurações' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {hub.description && (
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Descrição
                </h3>
                <p className="text-muted-foreground">
                  {hub.description}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {agents.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Agentes
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {agents.filter(agent => agent.isActive).length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ativos
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      0
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Conversas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-foreground">
                Agentes do Hub
              </h3>
              {onCreateAgent && (
                <Button
                  onClick={() => onCreateAgent(hub.id)}
                  variant="primary"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Novo Agente
                </Button>
              )}
            </div>
            
            {agents.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-foreground mb-2">
                  Nenhum agente encontrado
                </h4>
                <p className="text-muted-foreground mb-6">
                  Crie seu primeiro agente para este hub.
                </p>
                {onCreateAgent && (
                  <Button
                    onClick={() => onCreateAgent(hub.id)}
                    variant="primary"
                  >
                    Criar Primeiro Agente
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onEdit={onEditAgent}
                    onDelete={onDeleteAgent}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-foreground">
              Configurações do Hub
            </h3>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Configurações em desenvolvimento
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    As configurações avançadas do hub estarão disponíveis em breve.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HubDetails