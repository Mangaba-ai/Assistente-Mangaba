import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface Model {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

interface OllamaStatus {
  success: boolean;
  models: Model[];
  message: string;
  error?: string;
}

interface GenerateOptions {
  model?: string;
  system?: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stream?: boolean;
  max_tokens?: number;
  stop?: string[];
}

interface GenerateResponse {
  success: boolean;
  response: string;
  context?: number[];
  model: string;
  created_at?: string;
  done: boolean;
  error?: string;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

const useOllama = () => {
  const [status, setStatus] = useState<OllamaStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }, []);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/ollama/status`, {
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      setStatus(data);
      
      return data;
    } catch (error) {
      console.error('Erro ao verificar status do Ollama:', error);
      toast.error('Erro ao conectar com o Ollama');
      return { success: false, message: 'Erro de conexão', models: [] };
    } finally {
      setLoading(false);
    }
  }, [API_URL, getAuthHeaders]);

  const getModels = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/ollama/models`, {
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.models;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Erro ao buscar modelos:', error);
      toast.error('Erro ao buscar modelos disponíveis');
      return [];
    }
  }, [API_URL, getAuthHeaders]);

  const isModelAvailable = useCallback(async (modelName: string) => {
    try {
      const response = await fetch(`${API_URL}/ollama/model/${modelName}/check`, {
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      return data.success && data.available;
    } catch (error) {
      console.error('Erro ao verificar modelo:', error);
      return false;
    }
  }, [API_URL, getAuthHeaders]);

  const generate = useCallback(async (
    prompt: string, 
    options: GenerateOptions = {}
  ): Promise<GenerateResponse | null> => {
    if (!prompt.trim()) {
      toast.error('Prompt não pode estar vazio');
      return null;
    }

    setGenerating(true);
    
    try {
      const response = await fetch(`${API_URL}/ollama/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          prompt,
          ...options
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data;
      } else {
        toast.error(`Erro: ${data.message}`);
        return null;
      }
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      toast.error('Erro ao gerar resposta');
      return null;
    } finally {
      setGenerating(false);
    }
  }, [API_URL, getAuthHeaders]);

  const generateStream = useCallback(async (
    prompt: string,
    options: GenerateOptions = {},
    onChunk?: (chunk: string, data: any) => void
  ): Promise<string> => {
    if (!prompt.trim()) {
      toast.error('Prompt não pode estar vazio');
      return '';
    }

    setGenerating(true);
    
    try {
      const response = await fetch(`${API_URL}/ollama/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          prompt,
          stream: true,
          ...options
        })
      });
      
      if (!response.ok) {
        throw new Error('Erro na requisição');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              
              if (data.type === 'chunk' && data.content) {
                fullResponse += data.content;
                if (onChunk) {
                  onChunk(data.content, data);
                }
              } else if (data.type === 'error') {
                throw new Error(data.message);
              } else if (data.type === 'done') {
                break;
              }
            } catch (parseError) {
              console.warn('Erro ao parsear chunk:', parseError);
            }
          }
        }
      }
      
      return fullResponse;
    } catch (error) {
      console.error('Erro ao gerar resposta em streaming:', error);
      toast.error('Erro ao gerar resposta');
      return '';
    } finally {
      setGenerating(false);
    }
  }, [API_URL, getAuthHeaders]);

  const pullModel = useCallback(async (
    modelName: string,
    onProgress?: (progress: any) => void
  ) => {
    if (!modelName.trim()) {
      toast.error('Nome do modelo é obrigatório');
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/ollama/pull`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ model: modelName })
      });
      
      if (!response.ok) {
        const data = await response.json();
        toast.error(`Erro: ${data.message}`);
        return false;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              
              if (onProgress) {
                onProgress(data);
              }
              
              if (data.success) {
                toast.success(`Modelo ${modelName} baixado com sucesso!`);
                return true;
              }
            } catch (parseError) {
              console.warn('Erro ao parsear progresso:', parseError);
            }
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao baixar modelo:', error);
      toast.error('Erro ao baixar modelo');
      return false;
    }
  }, [API_URL, getAuthHeaders]);

  const deleteModel = useCallback(async (modelName: string) => {
    try {
      const response = await fetch(`${API_URL}/ollama/models/${modelName}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Modelo ${modelName} removido com sucesso!`);
        return true;
      } else {
        toast.error(`Erro: ${data.message}`);
        return false;
      }
    } catch (error) {
      console.error('Erro ao remover modelo:', error);
      toast.error('Erro ao remover modelo');
      return false;
    }
  }, [API_URL, getAuthHeaders]);

  const generateEmbeddings = useCallback(async (
    text: string,
    model = 'nomic-embed-text'
  ) => {
    try {
      const response = await fetch(`${API_URL}/ollama/embeddings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text, model })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.embeddings;
      } else {
        toast.error(`Erro: ${data.message}`);
        return null;
      }
    } catch (error) {
      console.error('Erro ao gerar embeddings:', error);
      toast.error('Erro ao gerar embeddings');
      return null;
    }
  }, [API_URL, getAuthHeaders]);

  return {
    status,
    loading,
    generating,
    checkStatus,
    getModels,
    isModelAvailable,
    generate,
    generateStream,
    pullModel,
    deleteModel,
    generateEmbeddings
  };
};

export default useOllama;