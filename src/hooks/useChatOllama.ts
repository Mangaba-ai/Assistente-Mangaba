import { useCallback } from 'react'
import useOllama from './useOllama'
import { Agent, Hub } from '../stores/chatStore'
import { toast } from 'react-hot-toast'

interface ChatOllamaOptions {
  agent?: Agent | null
  hub?: Hub | null
  onChunk?: (chunk: string) => void
}

const useChatOllama = () => {
  const { generate, generateStream, generating } = useOllama()

  const sendMessage = useCallback(async (
    message: string,
    options: ChatOllamaOptions = {}
  ): Promise<string> => {
    const { agent, hub, onChunk } = options

    if (!message.trim()) {
      toast.error('Mensagem não pode estar vazia')
      return ''
    }

    try {
      // Usar configuração do agente se disponível
      const model = agent?.configuration?.model || 'mistral:latest'
      const temperature = agent?.configuration?.temperature || 0.7
      const maxTokens = agent?.configuration?.maxTokens || 2048
      
      // Construir system prompt baseado no agente e hub
      let systemPrompt = ''
      if (agent && hub) {
        systemPrompt = `${agent.systemPrompt}\n\nVocê está atuando como ${agent.name} no hub ${hub.name}. ${hub.description}`
      } else if (agent) {
        systemPrompt = agent.systemPrompt
      } else {
        systemPrompt = 'Você é um assistente útil e prestativo.'
      }

      // Se há callback para chunks, usar streaming
      if (onChunk) {
        return await generateStream(message, {
          model,
          system: systemPrompt,
          temperature,
          max_tokens: maxTokens
        }, onChunk)
      } else {
        // Usar geração normal
        const response = await generate(message, {
          model,
          system: systemPrompt,
          temperature,
          max_tokens: maxTokens
        })
        
        return response?.response || 'Desculpe, não consegui gerar uma resposta.'
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem para Ollama:', error)
      toast.error('Erro ao gerar resposta com Ollama')
      return 'Desculpe, ocorreu um erro ao processar sua mensagem.'
    }
  }, [generate, generateStream])

  const isGenerating = generating

  return {
    sendMessage,
    isGenerating
  }
}

export default useChatOllama