export interface OllamaModel {
  name: string
  size: number
  digest: string
  modified_at: string
  details?: OllamaModelDetails
}

export interface OllamaModelDetails {
  format: string
  family: string
  families: string[]
  parameter_size: string
  quantization_level: string
}

export interface OllamaStatus {
  success: boolean
  models: OllamaModel[]
  message: string
  error?: string
}

export interface OllamaGenerateOptions {
  model?: string
  system?: string
  temperature?: number
  top_p?: number
  top_k?: number
  stream?: boolean
  max_tokens?: number
  stop?: string[]
  repeat_penalty?: number
  context?: number[]
}

export interface OllamaGenerateResponse {
  success: boolean
  response: string
  context?: number[]
  model: string
  created_at?: string
  done: boolean
  error?: string
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  eval_count?: number
}

export interface OllamaStreamChunk {
  model: string
  created_at: string
  response: string
  done: boolean
  context?: number[]
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  eval_count?: number
}

export interface ChatOllamaOptions {
  agent?: import('./agent').Agent | null
  hub?: import('./hub').Hub | null
  files?: import('./chat').FileAttachment[]
  context?: number[]
}