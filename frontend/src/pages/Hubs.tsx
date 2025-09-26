import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Edit3,
  Trash2,
  Users,
  Settings,
  MessageSquare,
  Building2,
  Code,
  DollarSign,
  Megaphone,
  Shield,
  Heart,
  Briefcase,
  Palette,
  X,
  RefreshCw,
  Bot
} from 'lucide-react'
import { useChatStore, Hub, Agent } from '../stores/chatStore'
import { useNavigate } from 'react-router-dom'
import { cn } from '../utils/cn'
import { toast } from 'react-hot-toast'
import useOllama from '../hooks/useOllama'

interface Model {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

const iconMap = {
  Building2,
  Code,
  DollarSign,
  Megaphone,
  Shield,
  Heart,
  Briefcase,
  Palette,
  Users,
  Settings
}

const colorOptions = [
  { name: 'black', class: 'bg-black' },
  { name: 'white', class: 'bg-white' },
  { name: 'red', class: 'bg-red-500' },
  { name: 'blue', class: 'bg-blue-500' },
  { name: 'green', class: 'bg-green-500' },
  { name: 'yellow', class: 'bg-yellow-500' },
  { name: 'purple', class: 'bg-purple-500' },
  { name: 'pink', class: 'bg-pink-500' }
]

const Hubs = () => {
  const navigate = useNavigate()
  const {
    hubs,
    createHub,
    updateHub,
    deleteHub,
    createAgent,
    updateAgent,
    deleteAgent,
    setSelectedHub,
    setSelectedAgent,
    createChat
  } = useChatStore()
  
  // Debug logs
  console.log('Hubs component rendered')
  console.log('Hubs data:', hubs)
  console.log('Number of hubs:', hubs?.length || 0)
  
  const { getModels, loading: ollamaLoading } = useOllama()
  const [ollamaModels, setOllamaModels] = useState<Model[]>([])
  const [showOllamaModels, setShowOllamaModels] = useState(false)
  
  const [showCreateHub, setShowCreateHub] = useState(false)
  const [showCreateAgent, setShowCreateAgent] = useState<string | null>(null)
  const [editingHub, setEditingHub] = useState<string | null>(null)
  const [editingAgent, setEditingAgent] = useState<string | null>(null)
  
  const [hubForm, setHubForm] = useState({
    name: '',
    description: '',
    icon: 'Building2',
    color: 'gray',
    category: 'business',
    tags: [] as string[],
    isActive: true
  })
  
  const [agentForm, setAgentForm] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    capabilities: [''] as string[],
    isActive: true,
    version: '1.0.0',
    ollamaModel: ''
  })
  
  // Carregar modelos do Ollama
  useEffect(() => {
    loadOllamaModels()
  }, [])

  const loadOllamaModels = async () => {
    try {
      const models = await getModels()
      setOllamaModels(models)
    } catch (error) {
      console.error('Erro ao carregar modelos do Ollama:', error)
    }
  }

  const handleCreateHub = () => {
    if (!hubForm.name.trim()) {
      toast.error('Nome do hub é obrigatório')
      return
    }
    
    if (editingHub) {
      updateHub(editingHub, hubForm)
      toast.success('Hub atualizado com sucesso!')
      setEditingHub(null)
    } else {
      createHub({ ...hubForm, updatedAt: new Date() })
      toast.success('Hub criado com sucesso!')
    }
    
    setShowCreateHub(false)
    setHubForm({ 
      name: '', 
      description: '', 
      icon: 'Building2', 
      color: 'blue',
      category: 'business',
      tags: [],
      isActive: true
    })
  }
  
  const handleCreateAgent = (hubId: string) => {
    if (!agentForm.name.trim()) {
      toast.error('Nome do agente é obrigatório')
      return
    }
    
    const capabilities = agentForm.capabilities.filter(cap => cap.trim())
    
    if (editingAgent) {
      updateAgent(hubId, editingAgent, {
        ...agentForm,
        capabilities
      })
      toast.success('Agente atualizado com sucesso!')
      setEditingAgent(null)
    } else {
      createAgent(hubId, {
        ...agentForm,
        capabilities,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      toast.success('Agente criado com sucesso!')
    }
    
    setShowCreateAgent(null)
    setAgentForm({ 
      name: '', 
      description: '', 
      systemPrompt: '', 
      capabilities: [''],
      isActive: true,
      version: '1.0.0',
      ollamaModel: ''
    })
  }
  
  const handleEditHub = (hub: Hub) => {
    setHubForm({
      name: hub.name,
      description: hub.description,
      icon: hub.icon,
      color: hub.color,
      category: hub.category || 'business',
      tags: hub.tags || [],
      isActive: hub.isActive ?? true
    })
    setEditingHub(hub.id)
    setShowCreateHub(true)
  }
  
  const handleEditAgent = (agent: Agent) => {
    setAgentForm({
      name: agent.name,
      description: agent.description,
      systemPrompt: agent.systemPrompt,
      capabilities: agent.capabilities.length > 0 ? agent.capabilities : [''],
      isActive: agent.isActive ?? true,
      version: agent.version || '1.0.0',
      ollamaModel: agent.ollamaModel || ''
    })
    setEditingAgent(agent.id)
    setShowCreateAgent(agent.hubId)
  }
  
  const handleSelectAgent = async (hubId: string, agentId: string) => {
    try {
      setSelectedHub(hubId)
      setSelectedAgent(agentId)
      await createChat(hubId, agentId)
      navigate('/app/chat')
      toast.success('Agente selecionado! Nova conversa iniciada.')
    } catch (error) {
      console.error('Error selecting agent:', error)
      toast.error('Erro ao iniciar conversa. Tente novamente.')
    }
  }
  
  const addCapability = () => {
    setAgentForm(prev => ({
      ...prev,
      capabilities: [...prev.capabilities, '']
    }))
  }
  
  const updateCapability = (index: number, value: string) => {
    setAgentForm(prev => ({
      ...prev,
      capabilities: prev.capabilities.map((cap, i) => i === index ? value : cap)
    }))
  }
  
  const removeCapability = (index: number) => {
    setAgentForm(prev => ({
      ...prev,
      capabilities: prev.capabilities.filter((_, i) => i !== index)
    }))
  }
  
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hubs de Agentes</h1>
            <p className="text-muted-foreground mt-1">
              Crie e gerencie hubs especializados com agentes personalizados
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOllamaModels(true)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              title="Ver modelos Ollama disponíveis"
            >
              <Bot size={18} />
              Modelos Ollama
            </button>
            <button
              onClick={() => setShowCreateHub(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus size={18} />
              Criar Hub
            </button>
          </div>
        </div>
      </div>
      
      {/* Hubs Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {hubs.map((hub) => {
              const IconComponent = iconMap[hub.icon as keyof typeof iconMap] || Building2
              
              return (
                <motion.div
                  key={hub.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all"
                >
                  {/* Hub Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        colorOptions.find(c => c.name === hub.color)?.class || 'bg-gray-500'
                      )}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{hub.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {hub.agents.length} agente{hub.agents.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditHub(hub)}
                        className="p-2 rounded-lg hover:bg-accent transition-colors"
                        title="Editar hub"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja excluir este hub?')) {
                            deleteHub(hub.id)
                            toast.success('Hub excluído com sucesso!')
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                        title="Excluir hub"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{hub.description}</p>
                  
                  {/* Agents */}
                  <div className="space-y-2 mb-4">
                    {hub.agents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">{agent.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {agent.description}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSelectAgent(hub.id, agent.id)}
                            className="p-1 rounded hover:bg-accent transition-colors"
                            title="Selecionar agente"
                          >
                            <MessageSquare size={14} />
                          </button>
                          <button
                            onClick={() => handleEditAgent(agent)}
                            className="p-1 rounded hover:bg-accent transition-colors"
                            title="Editar agente"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Tem certeza que deseja excluir este agente?')) {
                                deleteAgent(agent.id)
                                toast.success('Agente excluído com sucesso!')
                              }
                            }}
                            className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                            title="Excluir agente"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add Agent Button */}
                  <button
                    onClick={() => setShowCreateAgent(hub.id)}
                    className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <Plus size={16} />
                    Adicionar Agente
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Ollama Models Modal */}
      <AnimatePresence>
        {showOllamaModels && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowOllamaModels(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Bot size={20} />
                  Modelos Ollama Disponíveis
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadOllamaModels}
                    disabled={ollamaLoading}
                    className="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                    title="Recarregar modelos"
                  >
                    <RefreshCw size={16} className={ollamaLoading ? 'animate-spin' : ''} />
                  </button>
                  <button
                    onClick={() => setShowOllamaModels(false)}
                    className="p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              
              {ollamaLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="animate-spin mr-2" size={20} />
                  Carregando modelos...
                </div>
              ) : ollamaModels.length > 0 ? (
                <div className="space-y-3">
                  {ollamaModels.map((model) => (
                    <div
                      key={model.name}
                      className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{model.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Tamanho: {(model.size / 1024 / 1024 / 1024).toFixed(2)} GB
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Modificado: {new Date(model.modified_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {model.digest?.substring(0, 12)}...
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nenhum modelo Ollama encontrado</p>
                  <p className="text-sm mt-2">
                    Certifique-se de que o Ollama está rodando e possui modelos instalados
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Hub Modal */}
      <AnimatePresence>
        {showCreateHub && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowCreateHub(false)
              setEditingHub(null)
              setHubForm({ name: '', description: '', icon: 'Building2', color: 'gray', category: 'business', tags: [], isActive: true })
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {editingHub ? 'Editar Hub' : 'Criar Novo Hub'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateHub(false)
                    setEditingHub(null)
                    setHubForm({ name: '', description: '', icon: 'Building2', color: 'blue', category: 'business', tags: [], isActive: true })
                  }}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome</label>
                  <input
                    type="text"
                    value={hubForm.name}
                    onChange={(e) => setHubForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-input rounded-lg bg-background"
                    placeholder="Ex: Tecnologia, Marketing, Financeiro"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={hubForm.description}
                    onChange={(e) => setHubForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-input rounded-lg bg-background h-20 resize-none"
                    placeholder="Descreva o propósito deste hub"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Ícone</label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(iconMap).map(([iconName, IconComponent]) => (
                      <button
                        key={iconName}
                        onClick={() => setHubForm(prev => ({ ...prev, icon: iconName }))}
                        className={cn(
                          "p-3 rounded-lg border transition-colors",
                          hubForm.icon === iconName
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-accent"
                        )}
                      >
                        <IconComponent size={20} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Cor</label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setHubForm(prev => ({ ...prev, color: color.name }))}
                        className={cn(
                          "w-12 h-12 rounded-lg border-2 transition-all",
                          color.class,
                          hubForm.color === color.name
                            ? "border-foreground scale-110"
                            : "border-transparent"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateHub(false)
                    setEditingHub(null)
                    setHubForm({ name: '', description: '', icon: 'Building2', color: 'blue', category: 'business', tags: [], isActive: true })
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateHub}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {editingHub ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Create/Edit Agent Modal */}
      <AnimatePresence>
        {showCreateAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
                  setShowCreateAgent(null)
                  setEditingAgent(null)
                  setAgentForm({ name: '', description: '', systemPrompt: '', capabilities: [''], isActive: true, version: '1.0.0', ollamaModel: '' })
                }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {editingAgent ? 'Editar Agente' : 'Criar Novo Agente'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateAgent(null)
                    setEditingAgent(null)
                    setAgentForm({ name: '', description: '', systemPrompt: '', capabilities: [''], isActive: true, version: '1.0.0', ollamaModel: '' })
                  }}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome</label>
                  <input
                    type="text"
                    value={agentForm.name}
                    onChange={(e) => setAgentForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-input rounded-lg bg-background"
                    placeholder="Ex: Analista Financeiro, Desenvolvedor Senior"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={agentForm.description}
                    onChange={(e) => setAgentForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-input rounded-lg bg-background h-20 resize-none"
                    placeholder="Descreva a especialidade deste agente"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Prompt do Sistema</label>
                  <textarea
                    value={agentForm.systemPrompt}
                    onChange={(e) => setAgentForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
                    className="w-full p-3 border border-input rounded-lg bg-background h-32 resize-none"
                    placeholder="Defina como este agente deve se comportar e responder..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Modelo Ollama</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={agentForm.ollamaModel}
                      onChange={(e) => setAgentForm(prev => ({ ...prev, ollamaModel: e.target.value }))}
                      className="flex-1 p-3 border border-input rounded-lg bg-background"
                    >
                      <option value="">Selecione um modelo</option>
                      {ollamaModels.map((model) => (
                        <option key={model.name} value={model.name}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={loadOllamaModels}
                      disabled={ollamaLoading}
                      className="p-3 border border-input rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                      title="Recarregar modelos"
                    >
                      <RefreshCw size={16} className={ollamaLoading ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Capacidades</label>
                  <div className="space-y-2">
                    {agentForm.capabilities.map((capability, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={capability}
                          onChange={(e) => updateCapability(index, e.target.value)}
                          className="flex-1 p-2 border border-input rounded-lg bg-background"
                          placeholder="Ex: Análise de dados, Programação Python"
                        />
                        {agentForm.capabilities.length > 1 && (
                          <button
                            onClick={() => removeCapability(index)}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addCapability}
                      className="flex items-center gap-2 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus size={16} />
                      Adicionar capacidade
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateAgent(null)
                    setEditingAgent(null)
                    setAgentForm({ name: '', description: '', systemPrompt: '', capabilities: [''], isActive: true, version: '1.0.0', ollamaModel: '' })
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleCreateAgent(showCreateAgent!)}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {editingAgent ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Hubs