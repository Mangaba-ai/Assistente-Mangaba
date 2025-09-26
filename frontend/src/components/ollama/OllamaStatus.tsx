import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, RefreshCw, Download, Trash2, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Model {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

interface OllamaStatusData {
  success: boolean;
  models: Model[];
  message: string;
  error?: string;
}

const OllamaStatus: React.FC = () => {
  const [status, setStatus] = useState<OllamaStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [pullLoading, setPullLoading] = useState(false);
  const [newModel, setNewModel] = useState('');
  const [testPrompt, setTestPrompt] = useState('Olá! Como você está?');
  const [testResponse, setTestResponse] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const checkOllamaStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/ollama/status`, {
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      setStatus(data);
      
      if (data.success) {
        toast.success('Ollama conectado com sucesso!');
        if (data.models.length > 0 && !selectedModel) {
          setSelectedModel(data.models[0].name);
        }
      } else {
        toast.error(`Erro: ${data.message}`);
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const testGeneration = async () => {
    if (!testPrompt.trim()) {
      toast.error('Digite um prompt para testar');
      return;
    }

    if (!selectedModel) {
      toast.error('Selecione um modelo para testar');
      return;
    }

    setTestLoading(true);
    setTestResponse('');
    
    try {
      const response = await fetch(`${API_URL}/ollama/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          prompt: testPrompt,
          model: selectedModel,
          stream: false
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTestResponse(data.response);
        toast.success('Resposta gerada com sucesso!');
      } else {
        toast.error(`Erro: ${data.message}`);
      }
    } catch (error) {
      toast.error('Erro ao gerar resposta');
      console.error('Erro:', error);
    } finally {
      setTestLoading(false);
    }
  };

  const pullModel = async () => {
    if (!newModel.trim()) {
      toast.error('Digite o nome do modelo para baixar');
      return;
    }

    setPullLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/ollama/pull`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          model: newModel
        })
      });
      
      if (response.ok) {
        toast.success('Modelo baixado com sucesso!');
        setNewModel('');
        checkOllamaStatus(); // Atualizar lista de modelos
      } else {
        const data = await response.json();
        toast.error(`Erro: ${data.message}`);
      }
    } catch (error) {
      toast.error('Erro ao baixar modelo');
      console.error('Erro:', error);
    } finally {
      setPullLoading(false);
    }
  };

  const deleteModel = async (modelName: string) => {
    if (!confirm(`Tem certeza que deseja remover o modelo ${modelName}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/ollama/models/${modelName}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Modelo removido com sucesso!');
        checkOllamaStatus(); // Atualizar lista de modelos
      } else {
        toast.error(`Erro: ${data.message}`);
      }
    } catch (error) {
      toast.error('Erro ao remover modelo');
      console.error('Erro:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  useEffect(() => {
    checkOllamaStatus();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Status do Ollama
        </h2>
        <button
          onClick={checkOllamaStatus}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Status de Conexão */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {status?.success ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <XCircle className="w-6 h-6 text-red-500" />
          )}
          <span className="text-lg font-medium text-foreground">
            {status?.success ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          {status?.message || 'Verificando conexão...'}
        </p>
      </div>

      {/* Lista de Modelos */}
      {status?.success && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Modelos Disponíveis ({status.models.length})
          </h3>
          
          {status.models.length > 0 ? (
            <div className="space-y-2">
              {status.models.map((model) => (
                <div
                  key={model.name}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-foreground">
                      {model.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Tamanho: {formatFileSize(model.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteModel(model.name)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg"
                    title="Remover modelo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800 dark:text-yellow-200">
                Nenhum modelo encontrado. Baixe um modelo para começar.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Baixar Novo Modelo */}
      {status?.success && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Baixar Modelo
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              placeholder="Ex: llama2, codellama, mistral"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={pullModel}
              disabled={pullLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${pullLoading ? 'animate-pulse' : ''}`} />
              {pullLoading ? 'Baixando...' : 'Baixar'}
            </button>
          </div>
        </div>
      )}

      {/* Teste de Geração */}
      {status?.success && status.models.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Testar Geração
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Modelo
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {status.models.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prompt
              </label>
              <textarea
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Digite sua pergunta aqui..."
              />
            </div>
            
            <button
              onClick={testGeneration}
              disabled={testLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {testLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {testLoading ? 'Gerando...' : 'Testar'}
            </button>
            
            {testResponse && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Resposta
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {testResponse}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OllamaStatus;