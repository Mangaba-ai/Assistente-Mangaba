import React, { useState } from 'react'
import { Hub } from '../../types/hub'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface HubSettingsProps {
  hub: Hub
  onSave: (settings: Partial<Hub>) => void
  onCancel: () => void
  isLoading?: boolean
  className?: string
}

export const HubSettings: React.FC<HubSettingsProps> = ({
  hub,
  onSave,
  onCancel,
  isLoading = false,
  className = ''
}) => {
  const [settings, setSettings] = useState({
    name: hub?.name || '',
    description: hub?.description || '',
    maxAgents: 10,
    isActive: hub?.isActive ?? true,
    isPublic: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateSettings = () => {
    const newErrors: Record<string, string> = {}

    if (!settings.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (settings.maxAgents < 1 || settings.maxAgents > 100) {
      newErrors.maxAgents = 'Número de agentes deve estar entre 1 e 100'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateSettings()) {
      return
    }

    onSave({
      ...settings,
      updatedAt: new Date()
    })
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Configurações do Hub
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie as configurações e permissões do seu hub.
        </p>
      </div>

      <div className="space-y-6">
        {/* Informações Básicas */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Informações Básicas
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome do Hub
              </label>
              <Input
                id="name"
                type="text"
                value={settings.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                id="description"
                value={settings.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Configurações de Capacidade */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Capacidade
          </h3>
          
          <div>
            <label htmlFor="maxAgents" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número Máximo de Agentes
            </label>
            <Input
              id="maxAgents"
              type="number"
              min="1"
              max="100"
              value={settings.maxAgents.toString()}
              onChange={(e) => handleInputChange('maxAgents', parseInt(e.target.value) || 1)}
              className={errors.maxAgents ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.maxAgents && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.maxAgents}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Define quantos agentes podem ser criados neste hub.
            </p>
          </div>
        </div>

        {/* Configurações de Acesso */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Acesso e Permissões
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="isActive"
                type="checkbox"
                checked={settings.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Hub ativo
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="isPublic"
                type="checkbox"
                checked={settings.isPublic}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Permitir acesso público
              </label>
            </div>
          </div>
        </div>

        {/* Zona de Perigo */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
            Zona de Perigo
          </h3>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Excluir Hub
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Esta ação não pode ser desfeita. Todos os agentes e conversas serão perdidos.
                </p>
                <Button
                  variant="danger"
                  className="mt-3"
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja excluir este hub? Esta ação não pode ser desfeita.')) {
                      // Implementar lógica de exclusão
                    }
                  }}
                  disabled={isLoading}
                >
                  Excluir Hub Permanentemente
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  )
}

export default HubSettings