import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Moon,
  Sun,
  Monitor,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  Bell,
  Lock,
  Palette,
  Database,
  Zap,
  Shield,
  Settings as SettingsIcon,
  Bot
} from 'lucide-react'
import { useThemeStore } from '../stores/themeStore'
import { useChatStore } from '../stores/chatStore'
import { toast } from 'react-hot-toast'
import { cn } from '../utils/cn'
import OllamaStatus from '../components/ollama/OllamaStatus'

const Settings = () => {
  const { theme, setTheme } = useThemeStore()
  const { hubs, chats, clearAllChats, exportData, importData } = useChatStore()
  const [activeTab, setActiveTab] = useState('appearance')
  
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    soundEffects: false,
    compactMode: false,
    showTypingIndicator: true,
    autoExport: false,
    language: 'pt-BR',
    fontSize: 'medium',
    animationSpeed: 'normal'
  })
  
  const tabs = [
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'general', label: 'Geral', icon: SettingsIcon },
    { id: 'ollama', label: 'Ollama', icon: Bot },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'privacy', label: 'Privacidade', icon: Shield },
    { id: 'data', label: 'Dados', icon: Database },
    { id: 'advanced', label: 'Avançado', icon: Zap }
  ]
  
  const handleExportData = () => {
    try {
      const data = exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mangaba-assistente-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Dados exportados com sucesso!')
    } catch (error) {
      toast.error('Erro ao exportar dados')
    }
  }
  
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        importData(data)
        toast.success('Dados importados com sucesso!')
      } catch (error) {
        toast.error('Erro ao importar dados. Verifique o formato do arquivo.')
      }
    }
    reader.readAsText(file)
  }
  
  const handleClearAllData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      clearAllChats()
      toast.success('Todos os dados foram limpos!')
    }
  }
  
  const handleSaveSettings = () => {
    // Aqui você salvaria as configurações no localStorage ou backend
    localStorage.setItem('mangaba-settings', JSON.stringify(settings))
    toast.success('Configurações salvas!')
  }
  
  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Tema</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light', label: 'Claro', icon: Sun },
            { value: 'dark', label: 'Escuro', icon: Moon },
            { value: 'system', label: 'Sistema', icon: Monitor }
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value as any)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                theme === value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-accent"
              )}
            >
              <Icon size={24} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Tamanho da Fonte</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'small', label: 'Pequena' },
            { value: 'medium', label: 'Média' },
            { value: 'large', label: 'Grande' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSettings(prev => ({ ...prev, fontSize: value }))}
              className={cn(
                "p-3 rounded-lg border-2 transition-all",
                settings.fontSize === value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-accent"
              )}
            >
              <span className={cn(
                "font-medium",
                value === 'small' && "text-sm",
                value === 'medium' && "text-base",
                value === 'large' && "text-lg"
              )}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Velocidade das Animações</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'slow', label: 'Lenta' },
            { value: 'normal', label: 'Normal' },
            { value: 'fast', label: 'Rápida' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSettings(prev => ({ ...prev, animationSpeed: value }))}
              className={cn(
                "p-3 rounded-lg border-2 transition-all",
                settings.animationSpeed === value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-accent"
              )}
            >
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
  
  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Idioma</h3>
        <select
          value={settings.language}
          onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
          className="w-full p-3 border border-input rounded-lg bg-background"
        >
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en-US">English (US)</option>
          <option value="es-ES">Español</option>
          <option value="fr-FR">Français</option>
        </select>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Preferências</h3>
        
        {[
          { key: 'autoSave', label: 'Salvamento automático', description: 'Salva automaticamente as conversas' },
          { key: 'compactMode', label: 'Modo compacto', description: 'Interface mais compacta' },
          { key: 'showTypingIndicator', label: 'Indicador de digitação', description: 'Mostra quando o agente está digitando' },
          { key: 'soundEffects', label: 'Efeitos sonoros', description: 'Sons para notificações e ações' },
          { key: 'autoExport', label: 'Exportação automática', description: 'Exporta dados automaticamente' }
        ].map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
            <div>
              <div className="font-medium">{label}</div>
              <div className="text-sm text-muted-foreground">{description}</div>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
              className={cn(
                "w-12 h-6 rounded-full transition-all relative",
                settings[key as keyof typeof settings]
                  ? "bg-primary"
                  : "bg-muted"
              )}
            >
              <div className={cn(
                "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                settings[key as keyof typeof settings]
                  ? "left-6"
                  : "left-0.5"
              )} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
  
  const renderDataTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Estatísticas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-accent/50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{hubs.length}</div>
            <div className="text-sm text-muted-foreground">Hubs</div>
          </div>
          <div className="bg-accent/50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">
              {hubs.reduce((acc, hub) => acc + hub.agents.length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Agentes</div>
          </div>
          <div className="bg-accent/50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{chats.length}</div>
            <div className="text-sm text-muted-foreground">Conversas</div>
          </div>
          <div className="bg-accent/50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">
              {chats.reduce((acc, chat) => acc + chat.messages.length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Mensagens</div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Backup e Restauração</h3>
        <div className="space-y-3">
          <button
            onClick={handleExportData}
            className="w-full flex items-center justify-center gap-2 p-3 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <Download size={18} />
            Exportar Dados
          </button>
          
          <label className="w-full flex items-center justify-center gap-2 p-3 border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer">
            <Upload size={18} />
            Importar Dados
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
          
          <button
            onClick={handleClearAllData}
            className="w-full flex items-center justify-center gap-2 p-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
          >
            <Trash2 size={18} />
            Limpar Todos os Dados
          </button>
        </div>
      </div>
    </div>
  )
  
  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Notificações</h3>
        
        {[
          { key: 'notifications', label: 'Notificações gerais', description: 'Receber notificações do sistema' }
        ].map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
            <div>
              <div className="font-medium">{label}</div>
              <div className="text-sm text-muted-foreground">{description}</div>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
              className={cn(
                "w-12 h-6 rounded-full transition-all relative",
                settings[key as keyof typeof settings]
                  ? "bg-primary"
                  : "bg-muted"
              )}
            >
              <div className={cn(
                "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                settings[key as keyof typeof settings]
                  ? "left-6"
                  : "left-0.5"
              )} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
  
  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Privacidade e Segurança</h3>
        <div className="space-y-4">
          <div className="p-4 bg-accent/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={18} />
              <span className="font-medium">Dados Locais</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Todos os seus dados são armazenados localmente no seu navegador. 
              Nenhuma informação é enviada para servidores externos.
            </p>
          </div>
          
          <div className="p-4 bg-accent/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={18} />
              <span className="font-medium">Criptografia</span>
            </div>
            <p className="text-sm text-muted-foreground">
              As conversas são armazenadas de forma segura usando criptografia local.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
  
  const renderOllamaTab = () => (
    <div className="space-y-6">
      <OllamaStatus />
    </div>
  )

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Configurações Avançadas</h3>
        <div className="space-y-4">
          <button
            onClick={() => {
              localStorage.clear()
              window.location.reload()
            }}
            className="w-full flex items-center justify-center gap-2 p-3 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <RefreshCw size={18} />
            Resetar Aplicação
          </button>
          
          <div className="p-4 bg-accent/50 rounded-lg">
            <div className="text-sm text-muted-foreground">
              <strong>Versão:</strong> 2.0.0<br />
              <strong>Build:</strong> {new Date().toISOString().split('T')[0]}<br />
              <strong>Tecnologias:</strong> React 18, TypeScript, Vite, Tailwind CSS
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance': return renderAppearanceTab()
      case 'general': return renderGeneralTab()
      case 'ollama': return renderOllamaTab()
      case 'notifications': return renderNotificationsTab()
      case 'privacy': return renderPrivacyTab()
      case 'data': return renderDataTab()
      case 'advanced': return renderAdvancedTab()
      default: return renderAppearanceTab()
    }
  }
  
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Configurações</h1>
            <p className="text-muted-foreground mt-1">
              Personalize sua experiência com o Mangaba Assistente
            </p>
          </div>
          
          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Save size={18} />
            Salvar
          </button>
        </div>
      </div>
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-border p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Settings