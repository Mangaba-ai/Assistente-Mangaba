import React, { useState } from 'react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

interface ChatSettingsProps {
  isOpen: boolean
  onClose: () => void
  chatId?: string
}

interface ChatConfig {
  temperature: number
  maxTokens: number
  ollamaModel: string
  systemPrompt: string
}

export const ChatSettings: React.FC<ChatSettingsProps> = ({
  isOpen,
  onClose
}) => {
  const [config, setConfig] = useState<ChatConfig>({
    temperature: 0.7,
    maxTokens: 2048,
    ollamaModel: 'llama2',
    systemPrompt: 'Você é um assistente útil e prestativo.'
  })

  const handleSave = () => {
    // TODO: Implementar salvamento das configurações
    console.log('Salvando configurações:', config)
    onClose()
  }

  const handleReset = () => {
    setConfig({
      temperature: 0.7,
      maxTokens: 2048,
      ollamaModel: 'llama2',
      systemPrompt: 'Você é um assistente útil e prestativo.'
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurações do Chat">
      <div className="space-y-6">
        {/* Modelo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Modelo
          </label>
          <select
            value={config.ollamaModel}
            onChange={(e) => setConfig(prev => ({ ...prev, ollamaModel: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
            <option value="claude-3-sonnet">Claude 3 Sonnet</option>
            <option value="llama-2-70b">Llama 2 70B</option>
          </select>
        </div>

        {/* Temperatura */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Temperatura: {config.temperature}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={config.temperature}
            onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Mais focado</span>
            <span>Mais criativo</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Máximo de Tokens
          </label>
          <input
            type="number"
            min="1"
            max="8192"
            value={config.maxTokens}
            onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* System Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Prompt do Sistema
          </label>
          <textarea
            value={config.systemPrompt}
            onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            placeholder="Defina como o assistente deve se comportar..."
          />
        </div>

        {/* Botões */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleReset}
          >
            Restaurar Padrões
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ChatSettings