import type { ApiResponse } from '../types'
import { API_CONFIG } from '../constants'

// Configuração base da API
export class ApiClient {
  private baseUrl: string
  private timeout: number
  private retries: number
  private retryDelay: number

  constructor(baseUrl: string = API_CONFIG.baseUrl) {
    this.baseUrl = baseUrl
    this.timeout = API_CONFIG.timeout
    this.retries = API_CONFIG.retries
    this.retryDelay = API_CONFIG.retryDelay
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const token = localStorage.getItem('mangaba-token')

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        data,
        code: response.status
      }
    } catch (error) {
      if (retryCount < this.retries && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * Math.pow(2, retryCount))
        return this.request(endpoint, options, retryCount + 1)
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        code: 0
      }
    }
  }

  private shouldRetry(error: any): boolean {
    return (
      error.name === 'AbortError' ||
      error.message.includes('fetch') ||
      error.message.includes('network')
    )
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async upload<T>(endpoint: string, file: File): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {} // Remove Content-Type para FormData
    })
  }
}

// Instância padrão
export const apiClient = new ApiClient()

// Helpers para respostas
export const handleApiResponse = <T>(
  response: ApiResponse<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void
): boolean => {
  if (response.success && response.data) {
    onSuccess?.(response.data)
    return true
  } else {
    onError?.(response.error || 'Erro desconhecido')
    return false
  }
}

export const isApiError = (response: ApiResponse): boolean => {
  return !response.success
}

export const getApiErrorMessage = (response: ApiResponse): string => {
  return response.error || response.message || 'Erro desconhecido'
}