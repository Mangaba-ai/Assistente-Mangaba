import express from 'express'
import { body, param, query, validationResult } from 'express-validator'

const router = express.Router()

// Mock data for agents
const mockAgents = [
  {
    id: '1',
    name: 'Assistente Geral',
    description: 'Um assistente versátil para tarefas gerais',
    category: 'assistant',
    hubId: '1',
    personality: {
      type: 'helpful',
      tone: 'friendly',
      expertise: ['general', 'productivity']
    },
    configuration: {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: 'Você é um assistente útil e amigável.'
    },
    prompts: {
      greeting: 'Olá! Como posso ajudá-lo hoje?',
      fallback: 'Desculpe, não entendi. Pode reformular sua pergunta?'
    },
    settings: {
      isPublic: true,
      allowForks: true,
      isActive: true
    },
    stats: {
      usageCount: 150,
      rating: 4.5,
      forkCount: 12
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: 'mock-user-id'
  },
  {
    id: '2',
    name: 'Assistente Criativo',
    description: 'Especializado em tarefas criativas e brainstorming',
    category: 'creative',
    hubId: '2',
    personality: {
      type: 'creative',
      tone: 'casual',
      expertise: ['writing', 'design', 'brainstorming']
    },
    configuration: {
      model: 'gpt-4',
      temperature: 0.9,
      maxTokens: 3000,
      systemPrompt: 'Você é um assistente criativo que ajuda com ideias inovadoras.'
    },
    prompts: {
      greeting: 'Vamos criar algo incrível juntos!',
      fallback: 'Que tal explorarmos uma abordagem diferente?'
    },
    settings: {
      isPublic: true,
      allowForks: true,
      isActive: true
    },
    stats: {
      usageCount: 89,
      rating: 4.8,
      forkCount: 8
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: 'mock-user-id'
  },
  {
    id: '3',
    name: 'Tutor de Programação',
    description: 'Especialista em ensinar programação e desenvolvimento',
    category: 'educational',
    hubId: '3',
    personality: {
      type: 'expert',
      tone: 'professional',
      expertise: ['programming', 'software-development', 'algorithms']
    },
    configuration: {
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 4000,
      systemPrompt: 'Você é um tutor experiente em programação que explica conceitos de forma clara.'
    },
    prompts: {
      greeting: 'Olá! Pronto para aprender programação?',
      fallback: 'Vamos quebrar esse problema em partes menores.'
    },
    settings: {
      isPublic: true,
      allowForks: true,
      isActive: true
    },
    stats: {
      usageCount: 234,
      rating: 4.9,
      forkCount: 25
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: 'mock-user-id'
  }
]

// GET /api/agents - List all agents
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      hubId, 
      category, 
      search, 
      scope = 'all' 
    } = req.query
    
    let filteredAgents = [...mockAgents]
    
    // Filter by hubId
    if (hubId) {
      filteredAgents = filteredAgents.filter(agent => agent.hubId === hubId)
    }
    
    // Filter by category
    if (category) {
      filteredAgents = filteredAgents.filter(agent => agent.category === category)
    }
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      filteredAgents = filteredAgents.filter(agent => 
        agent.name.toLowerCase().includes(searchLower) ||
        agent.description.toLowerCase().includes(searchLower)
      )
    }
    
    // Filter by scope
    if (scope === 'own') {
      filteredAgents = filteredAgents.filter(agent => agent.owner === 'mock-user-id')
    } else if (scope === 'public') {
      filteredAgents = filteredAgents.filter(agent => agent.settings.isPublic)
    }
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + parseInt(limit)
    const paginatedAgents = filteredAgents.slice(startIndex, endIndex)
    
    res.json({
      success: true,
      data: paginatedAgents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredAgents.length,
        pages: Math.ceil(filteredAgents.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching agents:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch agents'
    })
  }
})

// POST /api/agents - Create new agent
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      description, 
      category, 
      hubId, 
      personality, 
      configuration, 
      prompts, 
      settings 
    } = req.body
    
    const newAgent = {
      id: (mockAgents.length + 1).toString(),
      name,
      description: description || '',
      category: category || 'assistant',
      hubId: hubId || null,
      personality: personality || {
        type: 'helpful',
        tone: 'friendly',
        expertise: []
      },
      configuration: configuration || {
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: 'Você é um assistente útil.'
      },
      prompts: prompts || {
        greeting: 'Olá! Como posso ajudá-lo?',
        fallback: 'Desculpe, não entendi.'
      },
      settings: settings || {
        isPublic: false,
        allowForks: true,
        isActive: true
      },
      stats: {
        usageCount: 0,
        rating: 0,
        forkCount: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: 'mock-user-id'
    }
    
    mockAgents.push(newAgent)
    
    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      data: newAgent
    })
  } catch (error) {
    console.error('Error creating agent:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create agent'
    })
  }
})

// GET /api/agents/popular - Get popular agents
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10, category } = req.query
    
    let popularAgents = [...mockAgents]
    
    if (category) {
      popularAgents = popularAgents.filter(agent => agent.category === category)
    }
    
    // Sort by rating and usage count
    popularAgents.sort((a, b) => {
      const scoreA = a.stats.rating * a.stats.usageCount
      const scoreB = b.stats.rating * b.stats.usageCount
      return scoreB - scoreA
    })
    
    const limitedAgents = popularAgents.slice(0, parseInt(limit))
    
    res.json({
      success: true,
      data: limitedAgents
    })
  } catch (error) {
    console.error('Error fetching popular agents:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch popular agents'
    })
  }
})

// GET /api/agents/:id - Get specific agent
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const agent = mockAgents.find(a => a.id === id)
    
    if (!agent) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Agent not found'
      })
    }
    
    res.json({
      success: true,
      data: agent
    })
  } catch (error) {
    console.error('Error fetching agent:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch agent'
    })
  }
})

// PUT /api/agents/:id - Update agent
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const agentIndex = mockAgents.findIndex(a => a.id === id)
    
    if (agentIndex === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Agent not found'
      })
    }
    
    const updatedAgent = {
      ...mockAgents[agentIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    }
    
    mockAgents[agentIndex] = updatedAgent
    
    res.json({
      success: true,
      message: 'Agent updated successfully',
      data: updatedAgent
    })
  } catch (error) {
    console.error('Error updating agent:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update agent'
    })
  }
})

// DELETE /api/agents/:id - Delete agent
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const agentIndex = mockAgents.findIndex(a => a.id === id)
    
    if (agentIndex === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Agent not found'
      })
    }
    
    mockAgents.splice(agentIndex, 1)
    
    res.json({
      success: true,
      message: 'Agent deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting agent:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete agent'
    })
  }
})

export default router