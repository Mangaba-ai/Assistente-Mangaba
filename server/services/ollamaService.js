import axios from 'axios';

class OllamaService {
  constructor() {
    this.baseURL = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.defaultModel = process.env.OLLAMA_DEFAULT_MODEL || 'mistral:latest';
    this.timeout = parseInt(process.env.OLLAMA_TIMEOUT) || 120000; // 2 minutos
  }

  /**
   * Testa a conexão com o Ollama
   */
  async testConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`, {
        timeout: 5000
      });
      return {
        success: true,
        models: response.data.models || [],
        message: 'Conexão com Ollama estabelecida com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Falha ao conectar com Ollama'
      };
    }
  }

  /**
   * Lista todos os modelos disponíveis
   */
  async getAvailableModels() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`);
      return response.data.models || [];
    } catch (error) {
      throw new Error(`Erro ao buscar modelos: ${error.message}`);
    }
  }

  /**
   * Verifica se um modelo específico está disponível
   */
  async isModelAvailable(modelName) {
    try {
      const models = await this.getAvailableModels();
      return models.some(model => model.name === modelName);
    } catch (error) {
      return false;
    }
  }

  /**
   * Gera uma resposta usando o Ollama
   */
  async generateResponse(prompt, options = {}) {
    const {
      model = this.defaultModel,
      system = '',
      context = [],
      stream = false,
      temperature = 0.7,
      top_p = 0.9,
      top_k = 40
    } = options;

    try {
      // Verifica se o modelo está disponível
      const modelAvailable = await this.isModelAvailable(model);
      if (!modelAvailable) {
        throw new Error(`Modelo ${model} não está disponível`);
      }

      const payload = {
        model,
        prompt,
        system,
        context,
        stream,
        options: {
          temperature,
          top_p,
          top_k
        }
      };

      const response = await axios.post(
        `${this.baseURL}/api/generate`,
        payload,
        {
          timeout: this.timeout,
          responseType: stream ? 'stream' : 'json'
        }
      );

      if (stream) {
        return response.data;
      }

      return {
        success: true,
        response: response.data.response,
        context: response.data.context,
        model: response.data.model,
        created_at: response.data.created_at,
        done: response.data.done
      };
    } catch (error) {
      throw new Error(`Erro ao gerar resposta: ${error.message}`);
    }
  }

  /**
   * Gera resposta em streaming
   */
  async generateStreamResponse(prompt, options = {}, onChunk) {
    const {
      model = this.defaultModel,
      system = '',
      context = [],
      temperature = 0.7,
      top_p = 0.9,
      top_k = 40
    } = options;

    try {
      const payload = {
        model,
        prompt,
        system,
        context,
        stream: true,
        options: {
          temperature,
          top_p,
          top_k
        }
      };

      const response = await axios.post(
        `${this.baseURL}/api/generate`,
        payload,
        {
          timeout: this.timeout,
          responseType: 'stream'
        }
      );

      let fullResponse = '';
      let finalContext = [];

      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            if (data.response) {
              fullResponse += data.response;
              if (onChunk) {
                onChunk(data.response, data);
              }
            }
            
            if (data.done) {
              finalContext = data.context || [];
            }
          } catch (parseError) {
            console.warn('Erro ao parsear chunk:', parseError.message);
          }
        }
      });

      return new Promise((resolve, reject) => {
        response.data.on('end', () => {
          resolve({
            success: true,
            response: fullResponse,
            context: finalContext,
            model
          });
        });

        response.data.on('error', (error) => {
          reject(new Error(`Erro no streaming: ${error.message}`));
        });
      });
    } catch (error) {
      throw new Error(`Erro ao gerar resposta em streaming: ${error.message}`);
    }
  }

  /**
   * Gera embeddings para um texto
   */
  async generateEmbeddings(text, model = 'nomic-embed-text') {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/embeddings`,
        {
          model,
          prompt: text
        },
        {
          timeout: this.timeout
        }
      );

      return {
        success: true,
        embeddings: response.data.embedding,
        model: response.data.model
      };
    } catch (error) {
      throw new Error(`Erro ao gerar embeddings: ${error.message}`);
    }
  }

  /**
   * Puxa um modelo do repositório
   */
  async pullModel(modelName, onProgress) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/pull`,
        { name: modelName },
        {
          timeout: 300000, // 5 minutos para download
          responseType: 'stream'
        }
      );

      return new Promise((resolve, reject) => {
        let lastStatus = '';

        response.data.on('data', (chunk) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              lastStatus = data.status;
              
              if (onProgress) {
                onProgress(data);
              }
              
              if (data.status === 'success') {
                resolve({ success: true, message: `Modelo ${modelName} baixado com sucesso` });
              }
            } catch (parseError) {
              console.warn('Erro ao parsear progresso:', parseError.message);
            }
          }
        });

        response.data.on('end', () => {
          if (lastStatus !== 'success') {
            resolve({ success: true, message: `Download do modelo ${modelName} concluído` });
          }
        });

        response.data.on('error', (error) => {
          reject(new Error(`Erro ao baixar modelo: ${error.message}`));
        });
      });
    } catch (error) {
      throw new Error(`Erro ao baixar modelo: ${error.message}`);
    }
  }

  /**
   * Remove um modelo
   */
  async deleteModel(modelName) {
    try {
      await axios.delete(`${this.baseURL}/api/delete`, {
        data: { name: modelName }
      });
      
      return {
        success: true,
        message: `Modelo ${modelName} removido com sucesso`
      };
    } catch (error) {
      throw new Error(`Erro ao remover modelo: ${error.message}`);
    }
  }
}

export default new OllamaService();