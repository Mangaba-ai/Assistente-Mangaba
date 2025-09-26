import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  DollarSign,
  Code,
  Megaphone,
  Bot,
  Check,
  X,
  Building2
} from 'lucide-react'
import { useChatStore } from '../stores/chatStore'
import { cn } from '../utils/cn'
import { logUserAction, logInfo } from '../utils/logger'

// Icon mapping for hubs
const iconMap = {
  DollarSign,
  Code,
  Megaphone,
  Bot,
  Building2
}


interface HubSelectorProps {
  isCollapsed?: boolean
  className?: string
  onHubChange?: (hubId: string | null) => void
  onAgentChange?: (agentId: string | null) => void
  disabled?: boolean
}

const HubSelector = ({ isCollapsed = false }: HubSelectorProps) => {
  const {
    hubs,
    selectedHubId,
    selectedAgentId,
    setSelectedHub,
    setSelectedAgent,
    getSelectedHub,
    getSelectedAgent,
    getActiveHubs,
    getActiveAgents
  } = useChatStore()
  
  const activeHubs = useMemo(() => getActiveHubs(), [getActiveHubs])
  
  const [isOpen, setIsOpen] = useState(false)
  
  const selectedHub = getSelectedHub()
  const selectedAgent = getSelectedAgent()
  
  const handleHubSelect = (hubId: string) => {
    const hub = hubs.find(h => h.id === hubId)
    setSelectedHub(hubId)
    setSelectedAgent(null) // Reset agent when hub changes
    if (isCollapsed) {
      setIsOpen(false)
    }
    
    if (hub) {
      logUserAction('hub_selected', {
        hubId: hub.id,
        hubName: hub.name,
        hubCategory: hub.category,
        agentCount: getActiveAgents(hub.id).length
      })
      
      logInfo(`Hub selecionado: ${hub.name}`, {
        category: 'navigation',
        hubId: hub.id
      })
    }
  }
  
  const handleAgentSelect = (agentId: string) => {
    console.log('HubSelector: handleAgentSelect called with agentId:', agentId)
    const agent = selectedHub ? getActiveAgents(selectedHub.id).find(a => a.id === agentId) : null
    console.log('HubSelector: Found agent:', agent)
    setSelectedAgent(agentId)
    console.log('HubSelector: setSelectedAgent called with:', agentId)
    setIsOpen(false)
    
    if (agent) {
      logUserAction('agent_selected', {
        agentId: agent.id,
        agentName: agent.name,
        hubId: selectedHub?.id,
        hubName: selectedHub?.name
      })
      
      logInfo(`Agente selecionado: ${agent.name}`, {
        category: 'navigation',
        agentId: agent.id,
        hubId: selectedHub?.id
      })
    }
  }
  
  const clearSelection = () => {
    const previousHub = selectedHub
    const previousAgent = selectedAgent
    
    setSelectedHub(null)
    setSelectedAgent(null)
    setIsOpen(false)
    
    logUserAction('selection_cleared', {
      previousHubId: previousHub?.id,
      previousHubName: previousHub?.name,
      previousAgentId: previousAgent?.id,
      previousAgentName: previousAgent?.name
    })
    
    logInfo('Seleção de hub e agente limpa', {
      category: 'navigation'
    })
  }
  
  if (isCollapsed) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 rounded-lg hover:bg-accent transition-colors flex items-center justify-center"
          title={selectedHub ? `${selectedHub.name}${selectedAgent ? ` - ${selectedAgent.name}` : ''}` : "Selecionar Hub"}
        >
          {selectedHub ? (
            (() => {
              const IconComponent = iconMap[selectedHub.icon as keyof typeof iconMap] || Bot
              return <IconComponent size={18} className={`text-${selectedHub.color}-500`} />
            })()
          ) : (
            <Building2 size={18} />
          )}
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              className="absolute left-full top-0 ml-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Selecionar Hub</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded hover:bg-accent"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {activeHubs.map((hub) => {
                    const IconComponent = iconMap[hub.icon as keyof typeof iconMap] || Bot
                    const isSelected = selectedHubId === hub.id
                    
                    return (
                      <div key={hub.id}>
                        <button
                          onClick={() => handleHubSelect(hub.id)}
                          className={cn(
                            "w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3",
                            isSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                          )}
                        >
                          <IconComponent size={18} className={isSelected ? "" : `text-${hub.color}-500`} />
                          <div className="flex-1">
                            <div className="font-medium">{hub.name}</div>
                            <div className={cn(
                              "text-sm",
                              isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}>
                              {hub.description}
                            </div>
                          </div>
                          {isSelected && <Check size={16} />}
                        </button>
                        
                        {isSelected && getActiveAgents(hub.id).length > 0 && (
                          <div className="ml-6 mt-2 space-y-1">
                            {getActiveAgents(hub.id).map((agent) => (
                              <button
                                key={agent.id}
                                onClick={() => handleAgentSelect(agent.id)}
                                className={cn(
                                  "w-full p-2 rounded text-left text-sm transition-colors flex items-center gap-2",
                                  selectedAgentId === agent.id
                                    ? "bg-accent text-accent-foreground"
                                    : "hover:bg-accent/50"
                                )}
                              >
                                <Bot size={14} />
                                <span>{agent.name}</span>
                                {selectedAgentId === agent.id && <Check size={12} />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                {(selectedHub || selectedAgent) && (
                  <button
                    onClick={clearSelection}
                    className="w-full mt-4 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Limpar seleção
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 rounded-lg hover:bg-accent transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {selectedHub ? (
            (() => {
              const IconComponent = iconMap[selectedHub.icon as keyof typeof iconMap] || Bot
              return <IconComponent size={18} className={`text-${selectedHub.color}-500`} />
            })()
          ) : (
            <Building2 size={18} />
          )}
          <div className="text-left">
            <div className="font-medium text-foreground">
              {selectedHub ? selectedHub.name : 'Selecionar Hub'}
            </div>
            {selectedAgent && (
              <div className="text-sm text-muted-foreground">{selectedAgent.name}</div>
            )}
          </div>
        </div>
        <ChevronDown size={16} className={cn(
          "transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2">
              {activeHubs.map((hub) => {
                const IconComponent = iconMap[hub.icon as keyof typeof iconMap] || Bot
                const isSelected = selectedHubId === hub.id
                
                return (
                  <div key={hub.id}>
                    <button
                      onClick={() => handleHubSelect(hub.id)}
                      className={cn(
                        "w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3 border",
                        isSelected 
                          ? "bg-success-subtle text-foreground border-success" 
                          : "hover:bg-accent border-transparent hover:border-warning/20"
                      )}
                    >
                      <IconComponent size={18} className={isSelected ? "" : `text-${hub.color}-500`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{hub.name}</span>
                          {hub.tags && hub.tags.length > 0 && (
                            <div className="flex gap-1">
                              {hub.tags.slice(0, 2).map((tag) => (
                                <span 
                                  key={tag}
                                  className="px-1.5 py-0.5 text-xs bg-warning-subtle rounded text-warning border border-warning/20"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className={cn(
                          "text-sm",
                          isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {hub.description}
                        </div>
                      </div>
                      {isSelected && <Check size={16} />}
                    </button>
                    
                    {isSelected && getActiveAgents(hub.id).length > 0 && (
                      <div className="ml-6 mt-2 space-y-1">
                        {getActiveAgents(hub.id).map((agent) => (
                          <button
                            key={agent.id}
                            onClick={() => handleAgentSelect(agent.id)}
                            className={cn(
                              "w-full p-2 rounded text-left text-sm transition-colors flex items-center gap-2",
                              selectedAgentId === agent.id
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-accent/50"
                            )}
                          >
                            <Bot size={14} />
                            <span>{agent.name}</span>
                            {selectedAgentId === agent.id && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            
            {(selectedHub || selectedAgent) && (
              <button
                onClick={clearSelection}
                className="w-full mt-4 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Limpar seleção
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HubSelector