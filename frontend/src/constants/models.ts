// Modelos padrão e configurações

export const DEFAULT_MODELS = [
  {
    name: 'llama3.2:latest',
    displayName: 'Llama 3.2',
    description: 'Modelo versátil para conversas gerais',
    category: 'general',
    size: '2.0GB',
    capabilities: ['text', 'reasoning']
  },
  {
    name: 'codellama:latest',
    displayName: 'Code Llama',
    description: 'Especializado em programação e código',
    category: 'coding',
    size: '3.8GB',
    capabilities: ['code', 'programming', 'debugging']
  },
  {
    name: 'mistral:latest',
    displayName: 'Mistral',
    description: 'Modelo eficiente para tarefas diversas',
    category: 'general',
    size: '4.1GB',
    capabilities: ['text', 'analysis', 'reasoning']
  },
  {
    name: 'phi3:latest',
    displayName: 'Phi-3',
    description: 'Modelo compacto e rápido',
    category: 'lightweight',
    size: '2.3GB',
    capabilities: ['text', 'quick-response']
  }
]

export const MODEL_CATEGORIES = {
  general: {
    name: 'Geral',
    description: 'Modelos versáteis para uso geral',
    color: 'blue'
  },
  coding: {
    name: 'Programação',
    description: 'Especializados em código e desenvolvimento',
    color: 'green'
  },
  lightweight: {
    name: 'Leve',
    description: 'Modelos compactos e rápidos',
    color: 'purple'
  },
  specialized: {
    name: 'Especializado',
    description: 'Modelos para tarefas específicas',
    color: 'orange'
  }
}

export const MODEL_CAPABILITIES = {
  text: 'Geração de texto',
  code: 'Programação',
  reasoning: 'Raciocínio lógico',
  analysis: 'Análise de dados',
  programming: 'Desenvolvimento',
  debugging: 'Depuração de código',
  'quick-response': 'Resposta rápida'
}

export const DEFAULT_MODEL_SETTINGS = {
  temperature: 0.7,
  top_p: 0.9,
  top_k: 40,
  repeat_penalty: 1.1,
  num_ctx: 2048,
  num_predict: 512
}