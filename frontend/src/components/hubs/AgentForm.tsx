import React, { useState } from 'react'
import { Agent } from '../../types/agent'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface AgentFormProps {
  agent?: Agent
  hubId: string
  onSubmit: (agentData: Partial<Agent>) => void
  onCancel: () => void
  isLoading?: boolean
  className?: string
}

export const AgentForm: React.FC<AgentFormProps> = ({
  agent,
  hubId,
  onSubmit,
  onCancel,
  isLoading = false,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    name: agent?.name || '',
    description: agent?.description || '',
    ollamaModel: agent?.ollamaModel || 'llama2',
    systemPrompt: agent?.systemPrompt || '',
    temperature: agent?.settings?.temperature || 0.7,
    maxTokens: agent?.settings?.maxTokens || 2048,
    isActive: agent?.isActive ?? true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const availableModels = [
    'llama2',
    'llama2:13b',
    'llama2:70b',
    'codellama',
    'codellama:13b',
    'mistral',
    'mixtral',
    'neural-chat',
    'starling-lm'
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres'
    }

    if (!formData.ollamaModel) {
      newErrors.ollamaModel = 'Modelo é obrigatório'
    }

    if (formData.temperature < 0 || formData.temperature > 2) {
      newErrors.temperature = 'Temperatura deve estar entre 0 e 2'
    }

    if (formData.maxTokens < 1 || formData.maxTokens > 8192) {
      newErrors.maxTokens = 'Máximo de tokens deve estar entre 1 e 8192'
    }

    if (formData.systemPrompt && formData.systemPrompt.length > 2000) {
      newErrors.systemPrompt = 'Prompt do sistema deve ter no máximo 2000 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    onSubmit({
      ...formData,
      id: agent?.id,
      hubId,
      updatedAt: new Date()
    })
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Nome do Agente *
          </label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Digite o nome do agente"
            className={errors.name ? 'border-red-500' : ''}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.name}
            </p>
          )}
        </div>

        {/* Modelo */}
        <div>
          <label htmlFor="ollamaModel" className="block text-sm font-medium text-foreground mb-2">
            Modelo *
          </label>
          <select
            id="ollamaModel"
            value={formData.ollamaModel}
            onChange={(e) => handleInputChange('ollamaModel', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
              errors.ollamaModel ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={isLoading}
          >
            <option value="">Selecione um modelo</option>
            {availableModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          {errors.ollamaModel && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.ollamaModel}
            </p>
          )}
        </div>
      </div>

      {/* Descrição */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
          Descrição
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Descreva o propósito deste agente (opcional)"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          disabled={isLoading}
        />
      </div>

      {/* Prompt do Sistema */}
      <div>
        <label htmlFor="systemPrompt" className="block text-sm font-medium text-foreground mb-2">
          Prompt do Sistema
        </label>
        <textarea
          id="systemPrompt"
          value={formData.systemPrompt}
          onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
          placeholder="Defina como o agente deve se comportar e responder..."
          rows={6}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white ${
            errors.systemPrompt ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          disabled={isLoading}
        />
        {errors.systemPrompt && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.systemPrompt}
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {formData.systemPrompt.length}/2000 caracteres
        </p>
      </div>

      {/* Configurações Avançadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temperatura */}
        <div>
          <label htmlFor="temperature" className="block text-sm font-medium text-foreground mb-2">
            Temperatura ({formData.temperature})
          </label>
          <input
            id="temperature"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={formData.temperature}
            onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            disabled={isLoading}
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Conservador (0)</span>
            <span>Criativo (2)</span>
          </div>
          {errors.temperature && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.temperature}
            </p>
          )}
        </div>

        {/* Máximo de Tokens */}
        <div>
          <label htmlFor="maxTokens" className="block text-sm font-medium text-foreground mb-2">
            Máximo de Tokens
          </label>
          <Input
            id="maxTokens"
            type="number"
            min="1"
            max="8192"
            value={formData.maxTokens.toString()}
            onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value) || 1)}
            className={errors.maxTokens ? 'border-red-500' : ''}
            disabled={isLoading}
          />
          {errors.maxTokens && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.maxTokens}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Controla o tamanho máximo da resposta.
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center">
        <input
          id="isActive"
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) => handleInputChange('isActive', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          disabled={isLoading}
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Agente ativo
        </label>
      </div>

      {/* Ações */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : agent ? 'Atualizar Agente' : 'Criar Agente'}
        </Button>
      </div>
    </form>
  )
}

export default AgentForm