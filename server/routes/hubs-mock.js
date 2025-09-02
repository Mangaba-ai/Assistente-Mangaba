import express from 'express'
import { body, param, query, validationResult } from 'express-validator'

const router = express.Router()

// Mock data for hubs
const mockHubs = [
  {
    id: '1',
    name: 'Trabalho',
    description: 'Hub para projetos de trabalho',
    icon: '💼',
    color: '#3B82F6',
    category: 'work',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: 'mock-user-id',
    collaborators: [],
    settings: {
      isPublic: false,
      allowCollaborators: true
    }
  },
  {
    id: '2',
    name: 'Pessoal',
    description: 'Hub para projetos pessoais',
    icon: '🏠',
    color: '#10B981',
    category: 'personal',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: 'mock-user-id',
    collaborators: [],
    settings: {
      isPublic: false,
      allowCollaborators: false
    }
  },
  {
    id: '3',
    name: 'Educação',
    description: 'Hub para estudos e aprendizado',
    icon: '📚',
    color: '#8B5CF6',
    category: 'education',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: 'mock-user-id',
    collaborators: [],
    settings: {
      isPublic: true,
      allowCollaborators: true
    }
  }
]

// GET /api/hubs - List all hubs
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status = 'active' } = req.query
    
    let filteredHubs = mockHubs.filter(hub => hub.status === status)
    
    if (category) {
      filteredHubs = filteredHubs.filter(hub => hub.category === category)
    }
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + parseInt(limit)
    const paginatedHubs = filteredHubs.slice(startIndex, endIndex)
    
    res.json({
      success: true,
      data: paginatedHubs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredHubs.length,
        pages: Math.ceil(filteredHubs.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching hubs:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch hubs'
    })
  }
})

// POST /api/hubs - Create new hub
router.post('/', async (req, res) => {
  try {
    const { name, description, icon, color, category } = req.body
    
    const newHub = {
      id: (mockHubs.length + 1).toString(),
      name,
      description: description || '',
      icon: icon || '📁',
      color: color || '#6B7280',
      category: category || 'other',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: 'mock-user-id',
      collaborators: [],
      settings: {
        isPublic: false,
        allowCollaborators: true
      }
    }
    
    mockHubs.push(newHub)
    
    res.status(201).json({
      success: true,
      message: 'Hub created successfully',
      data: newHub
    })
  } catch (error) {
    console.error('Error creating hub:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create hub'
    })
  }
})

// GET /api/hubs/:id - Get specific hub
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const hub = mockHubs.find(h => h.id === id)
    
    if (!hub) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Hub not found'
      })
    }
    
    res.json({
      success: true,
      data: hub
    })
  } catch (error) {
    console.error('Error fetching hub:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch hub'
    })
  }
})

// PUT /api/hubs/:id - Update hub
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const hubIndex = mockHubs.findIndex(h => h.id === id)
    
    if (hubIndex === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Hub not found'
      })
    }
    
    const updatedHub = {
      ...mockHubs[hubIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    }
    
    mockHubs[hubIndex] = updatedHub
    
    res.json({
      success: true,
      message: 'Hub updated successfully',
      data: updatedHub
    })
  } catch (error) {
    console.error('Error updating hub:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update hub'
    })
  }
})

// DELETE /api/hubs/:id - Delete hub
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const hubIndex = mockHubs.findIndex(h => h.id === id)
    
    if (hubIndex === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Hub not found'
      })
    }
    
    mockHubs.splice(hubIndex, 1)
    
    res.json({
      success: true,
      message: 'Hub deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting hub:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete hub'
    })
  }
})

export default router