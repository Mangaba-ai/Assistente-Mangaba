import React, { useState, useCallback, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { motion } from 'framer-motion'
import {
  User,
  Target,
  AlertTriangle,
  Lightbulb,
  Heart,
  Settings,
  TrendingUp,
  CheckCircle,
  XCircle,
  ArrowRight,
  Info,
  BarChart3,
  Zap,
  X
} from 'lucide-react'
import { cn } from '../utils/cn'
import Card from './ui/Card'
import Badge from './ui/Badge'

// Import the user journey data
const userJourneyData = {
  "userJourneyMap": {
    "platform": "Eraser",
    "version": "1.0",
    "createdAt": "2025-01-12",
    "description": "Mapa de jornada do usuário para a plataforma Eraser - Sistema de assistente de IA empresarial",
    "personas": [
      {
        "id": "business-user",
        "name": "Usuário Empresarial",
        "description": "Profissional que busca assistência de IA para tarefas específicas do negócio",
        "goals": [
          "Obter respostas especializadas para sua área de atuação",
          "Aumentar produtividade nas tarefas diárias",
          "Acessar conhecimento especializado rapidamente"
        ],
        "painPoints": [
          "Dificuldade em encontrar informações específicas",
          "Perda de tempo com pesquisas manuais",
          "Falta de expertise em certas áreas"
        ]
      },
      {
        "id": "admin-user",
        "name": "Administrador",
        "description": "Responsável por configurar e gerenciar a plataforma",
        "goals": [
          "Configurar hubs e agentes adequados",
          "Monitorar uso da plataforma",
          "Garantir segurança e compliance"
        ],
        "painPoints": [
          "Complexidade na configuração inicial",
          "Dificuldade em monitorar performance",
          "Necessidade de treinamento da equipe"
        ]
      }
    ],
    "journeyStages": [
      {
        "stage": "Descoberta",
        "description": "Usuário descobre a plataforma Eraser",
        "touchpoints": [
          {
            "id": "landing-page",
            "name": "Página de Landing",
            "description": "Primeira impressão da plataforma",
            "userActions": [
              "Visualiza benefícios da plataforma",
              "Entende o conceito de hubs e agentes",
              "Avalia se atende suas necessidades"
            ],
            "emotions": ["curiosidade", "interesse", "ceticismo"],
            "painPoints": [
              "Informações técnicas complexas",
              "Falta de exemplos práticos"
            ],
            "opportunities": [
              "Demonstrações interativas",
              "Casos de uso específicos por setor",
              "Vídeos explicativos"
            ]
          }
        ]
      },
      {
        "stage": "Onboarding",
        "description": "Processo de integração inicial",
        "touchpoints": [
          {
            "id": "welcome-screen",
            "name": "Tela de Boas-vindas",
            "description": "Primeira interação após login",
            "userActions": [
              "Cria conta ou faz login",
              "Visualiza tutorial inicial",
              "Configura preferências básicas"
            ],
            "emotions": ["expectativa", "ansiedade", "esperança"],
            "painPoints": [
              "Processo de registro longo",
              "Muitas opções de configuração"
            ],
            "opportunities": [
              "Onboarding progressivo",
              "Configuração automática inteligente",
              "Tour guiado interativo"
            ]
          },
          {
            "id": "hub-selection",
            "name": "Seleção de Hub",
            "description": "Escolha do hub mais adequado",
            "userActions": [
              "Explora hubs disponíveis",
              "Lê descrições de cada área",
              "Seleciona hub principal"
            ],
            "emotions": ["confusão", "decisão", "confiança"],
            "painPoints": [
              "Muitas opções disponíveis",
              "Descrições pouco claras"
            ],
            "opportunities": [
              "Recomendação baseada no perfil",
              "Preview de funcionalidades",
              "Possibilidade de testar antes de escolher"
            ]
          }
        ]
      },
      {
        "stage": "Primeiro Uso",
        "description": "Primeiras interações com a plataforma",
        "touchpoints": [
          {
            "id": "agent-selection",
            "name": "Seleção de Agente",
            "description": "Escolha do agente especializado",
            "userActions": [
              "Visualiza agentes disponíveis no hub",
              "Lê capacidades de cada agente",
              "Seleciona agente mais adequado"
            ],
            "emotions": ["curiosidade", "expectativa", "incerteza"],
            "painPoints": [
              "Diferenças entre agentes não claras",
              "Falta de exemplos de uso"
            ],
            "opportunities": [
              "Demonstrações de cada agente",
              "Casos de uso específicos",
              "Recomendações inteligentes"
            ]
          },
          {
            "id": "first-chat",
            "name": "Primeira Conversa",
            "description": "Primeira interação com o agente",
            "userActions": [
              "Digita primeira pergunta",
              "Avalia qualidade da resposta",
              "Testa diferentes tipos de perguntas"
            ],
            "emotions": ["nervosismo", "surpresa", "satisfação"],
            "painPoints": [
              "Não sabe como formular perguntas",
              "Respostas genéricas",
              "Tempo de resposta lento"
            ],
            "opportunities": [
              "Sugestões de perguntas",
              "Prompts pré-definidos",
              "Feedback em tempo real"
            ]
          }
        ]
      },
      {
        "stage": "Uso Regular",
        "description": "Utilização contínua da plataforma",
        "touchpoints": [
          {
            "id": "daily-interactions",
            "name": "Interações Diárias",
            "description": "Uso rotineiro da plataforma",
            "userActions": [
              "Acessa conversas anteriores",
              "Inicia novas conversas",
              "Alterna entre diferentes agentes",
              "Organiza histórico de conversas"
            ],
            "emotions": ["confiança", "produtividade", "satisfação"],
            "painPoints": [
              "Dificuldade em encontrar conversas antigas",
              "Falta de organização",
              "Repetição de contexto"
            ],
            "opportunities": [
              "Busca avançada",
              "Tags e categorização",
              "Continuidade de contexto",
              "Favoritos e bookmarks"
            ]
          },
          {
            "id": "advanced-features",
            "name": "Recursos Avançados",
            "description": "Exploração de funcionalidades avançadas",
            "userActions": [
              "Personaliza configurações",
              "Explora diferentes hubs",
              "Compartilha conversas",
              "Exporta dados"
            ],
            "emotions": ["descoberta", "empoderamento", "expertise"],
            "painPoints": [
              "Recursos escondidos",
              "Falta de documentação",
              "Configurações complexas"
            ],
            "opportunities": [
              "Dicas contextuais",
              "Tutoriais avançados",
              "Comunidade de usuários"
            ]
          }
        ]
      },
      {
        "stage": "Mastery",
        "description": "Domínio completo da plataforma",
        "touchpoints": [
          {
            "id": "power-user",
            "name": "Usuário Avançado",
            "description": "Utilização expert da plataforma",
            "userActions": [
              "Cria workflows personalizados",
              "Treina agentes customizados",
              "Integra com outras ferramentas",
              "Mentora outros usuários"
            ],
            "emotions": ["maestria", "liderança", "inovação"],
            "painPoints": [
              "Limitações da plataforma",
              "Falta de APIs avançadas",
              "Necessidade de customização"
            ],
            "opportunities": [
              "APIs robustas",
              "Marketplace de agentes",
              "Programa de embaixadores",
              "Feedback direto para desenvolvimento"
            ]
          }
        ]
      }
    ],
    "metrics": {
      "acquisition": [
        "Taxa de conversão da landing page",
        "Tempo até primeiro login",
        "Origem dos usuários"
      ],
      "activation": [
        "Taxa de conclusão do onboarding",
        "Tempo até primeira conversa",
        "Número de hubs explorados"
      ],
      "retention": [
        "Frequência de uso semanal",
        "Número de conversas por sessão",
        "Taxa de retorno em 7 dias"
      ],
      "engagement": [
        "Duração média das sessões",
        "Número de agentes utilizados",
        "Profundidade das conversas"
      ],
      "satisfaction": [
        "NPS (Net Promoter Score)",
        "Avaliação das respostas",
        "Taxa de resolução de problemas"
      ]
    },
    "improvementAreas": [
      {
        "area": "Onboarding",
        "priority": "high",
        "description": "Simplificar processo inicial e reduzir tempo até valor",
        "actions": [
          "Implementar onboarding progressivo",
          "Criar tour interativo",
          "Adicionar configuração automática"
        ]
      },
      {
        "area": "Discovery",
        "priority": "medium",
        "description": "Melhorar descoberta de funcionalidades",
        "actions": [
          "Adicionar dicas contextuais",
          "Criar centro de ajuda",
          "Implementar busca inteligente"
        ]
      },
      {
        "area": "Personalization",
        "priority": "high",
        "description": "Aumentar personalização da experiência",
        "actions": [
          "Implementar recomendações IA",
          "Permitir customização de interface",
          "Criar perfis de uso"
        ]
      }
    ],
    "technicalRequirements": [
      {
        "requirement": "Performance",
        "description": "Respostas rápidas e interface fluida",
        "metrics": ["Tempo de resposta < 2s", "Loading time < 1s"]
      },
      {
        "requirement": "Accessibility",
        "description": "Plataforma acessível para todos os usuários",
        "metrics": ["WCAG 2.1 AA compliance", "Suporte a screen readers"]
      },
      {
        "requirement": "Security",
        "description": "Proteção de dados e privacidade",
        "metrics": ["Criptografia end-to-end", "Compliance LGPD/GDPR"]
      }
    ]
  }
}

// Custom node types
const PersonaNode = ({ data }: { data: any }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg min-w-[250px] border-2 border-blue-300"
  >
    <Handle type="source" position={Position.Right} className="bg-blue-300" />
    <div className="flex items-center gap-2 mb-2">
      <User size={20} />
      <h3 className="font-bold text-lg">{data.name}</h3>
    </div>
    <p className="text-sm mb-3 opacity-90">{data.description}</p>
    
    <div className="space-y-2">
      <div>
        <div className="flex items-center gap-1 mb-1">
          <Target size={14} />
          <span className="text-xs font-semibold">Objetivos:</span>
        </div>
        <ul className="text-xs space-y-1">
          {data.goals.slice(0, 2).map((goal: string, idx: number) => (
            <li key={idx} className="opacity-90">• {goal}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <div className="flex items-center gap-1 mb-1">
          <AlertTriangle size={14} />
          <span className="text-xs font-semibold">Pontos de Dor:</span>
        </div>
        <ul className="text-xs space-y-1">
          {data.painPoints.slice(0, 2).map((pain: string, idx: number) => (
            <li key={idx} className="opacity-90">• {pain}</li>
          ))}
        </ul>
      </div>
    </div>
  </motion.div>
)

const StageNode = ({ data }: { data: any }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-lg min-w-[300px] border-2 border-purple-300"
  >
    <Handle type="target" position={Position.Left} className="bg-purple-300" />
    <Handle type="source" position={Position.Right} className="bg-purple-300" />
    
    <div className="flex items-center gap-2 mb-2">
      <BarChart3 size={20} />
      <h3 className="font-bold text-lg">{data.stage}</h3>
    </div>
    <p className="text-sm opacity-90">{data.description}</p>
    
    <div className="mt-3">
      <Badge className="bg-purple-200 text-purple-800 text-xs">
        {data.touchpoints?.length || 0} touchpoints
      </Badge>
    </div>
  </motion.div>
)

const TouchpointNode = ({ data }: { data: any }) => {
  const getEmotionColor = (emotions: string[]) => {
    if (emotions.includes('satisfação') || emotions.includes('confiança')) return 'from-green-500 to-green-600'
    if (emotions.includes('frustração') || emotions.includes('ansiedade')) return 'from-red-500 to-red-600'
    if (emotions.includes('curiosidade') || emotions.includes('interesse')) return 'from-yellow-500 to-yellow-600'
    return 'from-gray-500 to-gray-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "bg-gradient-to-br text-white p-4 rounded-lg shadow-lg min-w-[280px] border-2",
        getEmotionColor(data.emotions),
        data.emotions.includes('satisfação') ? 'border-green-300' : 
        data.emotions.includes('frustração') ? 'border-red-300' :
        data.emotions.includes('curiosidade') ? 'border-yellow-300' : 'border-gray-300'
      )}
    >
      <Handle type="target" position={Position.Left} className="bg-white" />
      <Handle type="source" position={Position.Right} className="bg-white" />
      
      <div className="flex items-center gap-2 mb-2">
        <Settings size={18} />
        <h4 className="font-bold">{data.name}</h4>
      </div>
      <p className="text-sm mb-3 opacity-90">{data.description}</p>
      
      <div className="space-y-2">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Heart size={12} />
            <span className="text-xs font-semibold">Emoções:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {data.emotions.map((emotion: string, idx: number) => (
              <Badge key={idx} className="bg-white/20 text-white text-xs">
                {emotion}
              </Badge>
            ))}
          </div>
        </div>
        
        {data.painPoints && data.painPoints.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <XCircle size={12} />
              <span className="text-xs font-semibold">Problemas:</span>
            </div>
            <ul className="text-xs space-y-1">
              {data.painPoints.slice(0, 2).map((pain: string, idx: number) => (
                <li key={idx} className="opacity-90">• {pain}</li>
              ))}
            </ul>
          </div>
        )}
        
        {data.opportunities && data.opportunities.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Lightbulb size={12} />
              <span className="text-xs font-semibold">Oportunidades:</span>
            </div>
            <ul className="text-xs space-y-1">
              {data.opportunities.slice(0, 2).map((opp: string, idx: number) => (
                <li key={idx} className="opacity-90">• {opp}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  )
}

const MetricsNode = ({ data }: { data: any }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg shadow-lg min-w-[250px] border-2 border-orange-300"
  >
    <Handle type="target" position={Position.Left} className="bg-orange-300" />
    
    <div className="flex items-center gap-2 mb-2">
      <TrendingUp size={18} />
      <h4 className="font-bold">Métricas</h4>
    </div>
    
    <div className="space-y-2">
      {Object.entries(data.metrics).map(([category, metrics]) => (
        <div key={category}>
          <span className="text-xs font-semibold capitalize">{category}:</span>
          <ul className="text-xs space-y-1 ml-2">
            {(metrics as string[]).slice(0, 2).map((metric, idx) => (
              <li key={idx} className="opacity-90">• {metric}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </motion.div>
)

const ImprovementNode = ({ data }: { data: any }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "bg-gradient-to-br text-white p-4 rounded-lg shadow-lg min-w-[280px] border-2",
      data.priority === 'high' ? 'from-red-500 to-red-600 border-red-300' :
      data.priority === 'medium' ? 'from-yellow-500 to-yellow-600 border-yellow-300' :
      'from-green-500 to-green-600 border-green-300'
    )}
  >
    <Handle type="target" position={Position.Left} className="bg-white" />
    
    <div className="flex items-center gap-2 mb-2">
      <Zap size={18} />
      <h4 className="font-bold">{data.area}</h4>
      <Badge className={cn(
        "text-xs",
        data.priority === 'high' ? 'bg-red-200 text-red-800' :
        data.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
        'bg-green-200 text-green-800'
      )}>
        {data.priority}
      </Badge>
    </div>
    
    <p className="text-sm mb-3 opacity-90">{data.description}</p>
    
    <div>
      <div className="flex items-center gap-1 mb-1">
        <CheckCircle size={12} />
        <span className="text-xs font-semibold">Ações:</span>
      </div>
      <ul className="text-xs space-y-1">
        {data.actions.slice(0, 2).map((action: string, idx: number) => (
          <li key={idx} className="opacity-90">• {action}</li>
        ))}
      </ul>
    </div>
  </motion.div>
)

const nodeTypes: NodeTypes = {
  persona: PersonaNode,
  stage: StageNode,
  touchpoint: TouchpointNode,
  metrics: MetricsNode,
  improvement: ImprovementNode,
}

interface UserJourneyMindMapProps {
  className?: string
}

export default function UserJourneyMindMap({ className }: UserJourneyMindMapProps) {
  // Create nodes and edges from the user journey data
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []
    
    const data = userJourneyData.userJourneyMap
    let nodeId = 0
    let yPosition = 0
    
    // Create persona nodes
    data.personas.forEach((persona) => {
      const id = `persona-${nodeId++}`
      nodes.push({
        id,
        type: 'persona',
        position: { x: 50, y: yPosition },
        data: persona,
      })
      yPosition += 300
    })
    
    // Create journey stage nodes and touchpoints
    let xPosition = 400
    data.journeyStages.forEach((stage, stageIndex) => {
      const stageId = `stage-${nodeId++}`
      nodes.push({
        id: stageId,
        type: 'stage',
        position: { x: xPosition, y: 100 + stageIndex * 200 },
        data: stage,
      })
      
      // Connect personas to first stage
      if (stageIndex === 0) {
        data.personas.forEach((_, personaIndex) => {
          edges.push({
            id: `persona-${personaIndex}-to-${stageId}`,
            source: `persona-${personaIndex}`,
            target: stageId,
            type: 'smoothstep',
            style: { stroke: '#8b5cf6', strokeWidth: 2 },
          })
        })
      }
      
      // Connect stages
      if (stageIndex > 0) {
        edges.push({
          id: `stage-${stageIndex - 1}-to-${stageIndex}`,
          source: `stage-${stageIndex - 1}`,
          target: stageId,
          type: 'smoothstep',
          style: { stroke: '#8b5cf6', strokeWidth: 2 },
        })
      }
      
      // Create touchpoint nodes
      let touchpointY = 100 + stageIndex * 200 + 100
      stage.touchpoints.forEach((touchpoint) => {
        const touchpointId = `touchpoint-${nodeId++}`
        nodes.push({
          id: touchpointId,
          type: 'touchpoint',
          position: { x: xPosition + 400, y: touchpointY },
          data: touchpoint,
        })
        
        // Connect stage to touchpoints
        edges.push({
          id: `${stageId}-to-${touchpointId}`,
          source: stageId,
          target: touchpointId,
          type: 'smoothstep',
          style: { stroke: '#6366f1', strokeWidth: 1.5 },
        })
        
        touchpointY += 150
      })
    })
    
    // Create metrics node
    const metricsId = `metrics-${nodeId++}`
    nodes.push({
      id: metricsId,
      type: 'metrics',
      position: { x: xPosition + 800, y: 50 },
      data: { metrics: data.metrics },
    })
    
    // Connect last stage to metrics
    if (data.journeyStages.length > 0) {
      edges.push({
        id: `final-stage-to-metrics`,
        source: `stage-${data.journeyStages.length - 1}`,
        target: metricsId,
        type: 'smoothstep',
        style: { stroke: '#f97316', strokeWidth: 2 },
      })
    }
    
    // Create improvement nodes
    let improvementY = 300
    data.improvementAreas.forEach((improvement) => {
      const improvementId = `improvement-${nodeId++}`
      nodes.push({
        id: improvementId,
        type: 'improvement',
        position: { x: xPosition + 800, y: improvementY },
        data: improvement,
      })
      
      // Connect metrics to improvements
      edges.push({
        id: `metrics-to-${improvementId}`,
        source: metricsId,
        target: improvementId,
        type: 'smoothstep',
        style: { stroke: '#f97316', strokeWidth: 1.5 },
      })
      
      improvementY += 200
    })
    
    return { initialNodes: nodes, initialEdges: edges }
  }, [])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  return (
    <div className={cn("h-full bg-background", className)}>
      <div className="flex h-full">
        {/* Main mind map */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-background"
          >
            <Background color="#e5e7eb" />
            <Controls />
          </ReactFlow>
        </div>
        
        {/* Sidebar with details */}
        {selectedNode && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="w-96 bg-card border-l border-border p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Detalhes</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-lg hover:bg-accent transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <Card className="p-4">
              <h4 className="font-semibold mb-2">{selectedNode.data.name || selectedNode.data.stage || selectedNode.data.area || 'Métricas'}</h4>
              
              {selectedNode.data.description && (
                <p className="text-sm text-muted-foreground mb-4">{selectedNode.data.description}</p>
              )}
              
              {/* Detailed information based on node type */}
              {selectedNode.type === 'persona' && (
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium flex items-center gap-2 mb-2">
                      <Target size={16} />
                      Objetivos
                    </h5>
                    <ul className="text-sm space-y-1">
                      {selectedNode.data.goals.map((goal: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium flex items-center gap-2 mb-2">
                      <AlertTriangle size={16} />
                      Pontos de Dor
                    </h5>
                    <ul className="text-sm space-y-1">
                      {selectedNode.data.painPoints.map((pain: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <XCircle size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                          {pain}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {selectedNode.type === 'touchpoint' && (
                <div className="space-y-4">
                  {selectedNode.data.userActions && (
                    <div>
                      <h5 className="font-medium flex items-center gap-2 mb-2">
                        <User size={16} />
                        Ações do Usuário
                      </h5>
                      <ul className="text-sm space-y-1">
                        {selectedNode.data.userActions.map((action: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <ArrowRight size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedNode.data.emotions && (
                    <div>
                      <h5 className="font-medium flex items-center gap-2 mb-2">
                        <Heart size={16} />
                        Emoções
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {selectedNode.data.emotions.map((emotion: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {emotion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedNode.data.painPoints && selectedNode.data.painPoints.length > 0 && (
                    <div>
                      <h5 className="font-medium flex items-center gap-2 mb-2">
                        <XCircle size={16} />
                        Problemas
                      </h5>
                      <ul className="text-sm space-y-1">
                        {selectedNode.data.painPoints.map((pain: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <XCircle size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                            {pain}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedNode.data.opportunities && selectedNode.data.opportunities.length > 0 && (
                    <div>
                      <h5 className="font-medium flex items-center gap-2 mb-2">
                        <Lightbulb size={16} />
                        Oportunidades
                      </h5>
                      <ul className="text-sm space-y-1">
                        {selectedNode.data.opportunities.map((opp: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Lightbulb size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                            {opp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {selectedNode.type === 'improvement' && (
                <div className="space-y-4">
                  <div>
                    <Badge className={cn(
                      "mb-2",
                      selectedNode.data.priority === 'high' ? 'bg-red-100 text-red-800' :
                      selectedNode.data.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    )}>
                      Prioridade: {selectedNode.data.priority}
                    </Badge>
                  </div>
                  
                  <div>
                    <h5 className="font-medium flex items-center gap-2 mb-2">
                      <CheckCircle size={16} />
                      Ações Recomendadas
                    </h5>
                    <ul className="text-sm space-y-1">
                      {selectedNode.data.actions.map((action: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {selectedNode.type === 'metrics' && (
                <div className="space-y-4">
                  {Object.entries(selectedNode.data.metrics).map(([category, metrics]) => (
                    <div key={category}>
                      <h5 className="font-medium flex items-center gap-2 mb-2 capitalize">
                        <BarChart3 size={16} />
                        {category}
                      </h5>
                      <ul className="text-sm space-y-1">
                        {(metrics as string[]).map((metric, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <TrendingUp size={14} className="text-orange-600 mt-0.5 flex-shrink-0" />
                            {metric}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-card border border-border rounded-lg p-4 shadow-lg">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Info size={16} />
          Legenda
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded"></div>
            <span>Personas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded"></div>
            <span>Etapas da Jornada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded"></div>
            <span>Touchpoints Positivos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded"></div>
            <span>Touchpoints Problemáticos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded"></div>
            <span>Métricas</span>
          </div>
        </div>
      </div>
    </div>
  )
}