import React, { useState } from 'react'
import { Hub } from '../../types/hub'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface HubFormProps {
  hub?: Hub
  onSubmit: (hubData: Partial<Hub>) => void
  onCancel: () => void
  isLoading?: boolean
  className?: string
}

export const HubForm: React.FC<HubFormProps> = ({
  hub,
  onSubmit,
  onCancel,
  isLoading = false,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    name: hub?.name || '',
    description: hub?.description || '',
    isActive: hub?.isActive ?? true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Descrição deve ter no máximo 500 caracteres'
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
      id: hub?.id,
      updatedAt: new Date()
    })
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nome do Hub *
        </label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Digite o nome do hub"
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
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Descreva o propósito deste hub (opcional)"
          rows={4}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
            errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          disabled={isLoading}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.description}
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {formData.description.length}/500 caracteres
        </p>
      </div>

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
          Hub ativo
        </label>
      </div>

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
          {isLoading ? 'Salvando...' : hub ? 'Atualizar Hub' : 'Criar Hub'}
        </Button>
      </div>
    </form>
  )
}

export default HubForm