import express from 'express'
import { body, param, query, validationResult } from 'express-validator'
import ollamaService from '../services/ollamaService.js'

const router = express.Router()

// Mock data storage
let mockChats = []
let chatIdCounter = 1
let messageIdCounter = 1

// Mock authentication middleware for testing
const mockAuthMiddleware = (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access Denied',
      message: 'No token provided or invalid format'
    })
  }

  // For mock purposes, just set a mock user
  req.user = {
    userId: 'mock-user-id',
    role: 'user',
    subscription: { plan: 'free' }
  }

  next()
}

// Validation rules
const createChatValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('hubId')
    .optional()
    .isString()
    .withMessage('Invalid hub ID'),
  body('agentId')
    .optional()
    .isString()
    .withMessage('Invalid agent ID')
]

const messageValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Message content must be between 1 and 10000 characters'),
  body('role')
    .isIn(['user', 'assistant', 'system'])
    .withMessage('Role must be user, assistant, or system'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array')
]

// GET /api/chat - List all chats
router.get('/', mockAuthMiddleware, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('hubId')
    .optional()
    .isString()
    .withMessage('Invalid hub ID'),
  query('status')
    .optional()
    .isIn(['active', 'archived', 'deleted'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const { page = 1, limit = 20, hubId, status = 'active' } = req.query
    
    let filteredChats = mockChats.filter(chat => 
      chat.userId === req.user.userId && chat.status === status
    )
    
    if (hubId) {
      filteredChats = filteredChats.filter(chat => chat.hubId === hubId)
    }
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + parseInt(limit)
    const paginatedChats = filteredChats.slice(startIndex, endIndex)
    
    res.json({
      success: true,
      data: paginatedChats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredChats.length,
        pages: Math.ceil(filteredChats.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching chats:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch chats'
    })
  }
})

// POST /api/chat - Create new chat
router.post('/', mockAuthMiddleware, createChatValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        messages: errors.array().map(err => err.msg)
      })
    }

    const { title, hubId, agentId } = req.body

    // Create new chat
    const newChat = {
      id: chatIdCounter.toString(),
      title,
      userId: req.user.userId,
      hubId: hubId || null,
      agentId: agentId || null,
      status: 'active',
      messages: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString()
    }

    mockChats.push(newChat)
    chatIdCounter++

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: newChat
    })
  } catch (error) {
    console.error('Error creating chat:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create chat'
    })
  }
})

// GET /api/chat/:id - Get specific chat
router.get('/:id', mockAuthMiddleware, [
  param('id').isString().withMessage('Invalid chat ID')
], async (req, res) => {
  try {
    const { id } = req.params
    
    const chat = mockChats.find(c => c.id === id && c.userId === req.user.userId)
    
    if (!chat) {
      return res.status(404).json({
        error: 'Chat Not Found',
        message: 'Chat not found or you do not have permission to access it'
      })
    }

    res.json({
      success: true,
      data: chat
    })
  } catch (error) {
    console.error('Error fetching chat:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch chat'
    })
  }
})

// POST /api/chat/:id/messages - Add message to chat
router.post('/:id/messages', mockAuthMiddleware, [
  param('id').isString().withMessage('Invalid chat ID'),
  ...messageValidation
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        messages: errors.array().map(err => err.msg)
      })
    }

    const { id } = req.params
    const { content, role, attachments = [] } = req.body
    
    const chat = mockChats.find(c => c.id === id && c.userId === req.user.userId)
    
    if (!chat) {
      return res.status(404).json({
        error: 'Chat Not Found',
        message: 'Chat not found or you do not have permission to access it'
      })
    }

    // Create new message
    const newMessage = {
      id: messageIdCounter.toString(),
      content,
      role,
      attachments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    chat.messages.push(newMessage)
    chat.lastMessageAt = new Date().toISOString()
    chat.updatedAt = new Date().toISOString()
    messageIdCounter++

    // If this is a user message, generate AI response using Ollama
    if (role === 'user') {
      try {
        // Build system prompt based on agent and hub
        let systemPrompt = 'Você é um assistente útil e prestativo.'
        
        // You can enhance this by loading actual agent/hub data
        if (chat.agentId) {
          // For now, use a generic system prompt based on agent ID
          systemPrompt = `Você é um agente especializado. Responda de forma profissional e útil.`
        }
        
        // Generate response using Ollama
        const aiResponse = await ollamaService.generateResponse(content, {
          model: 'mistral:latest',
          system: systemPrompt,
          temperature: 0.7
        })
        
        if (aiResponse.success) {
          // Create AI response message
          const aiMessage = {
            id: messageIdCounter.toString(),
            content: aiResponse.response,
            role: 'assistant',
            attachments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          chat.messages.push(aiMessage)
          chat.lastMessageAt = new Date().toISOString()
          chat.updatedAt = new Date().toISOString()
          messageIdCounter++
        }
      } catch (error) {
        console.error('Error generating AI response:', error)
        // Add error message
        const errorMessage = {
          id: messageIdCounter.toString(),
          content: 'Desculpe, não consegui gerar uma resposta.',
          role: 'assistant',
          attachments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        chat.messages.push(errorMessage)
        chat.lastMessageAt = new Date().toISOString()
        chat.updatedAt = new Date().toISOString()
        messageIdCounter++
      }
    }

    res.status(201).json({
      success: true,
      message: 'Message added successfully',
      data: newMessage
    })
  } catch (error) {
    console.error('Error adding message:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add message'
    })
  }
})

// PUT /api/chat/:id - Update chat
router.put('/:id', mockAuthMiddleware, [
  param('id').isString().withMessage('Invalid chat ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['active', 'archived'])
    .withMessage('Status must be active or archived')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        messages: errors.array().map(err => err.msg)
      })
    }

    const { id } = req.params
    const updates = req.body
    
    const chatIndex = mockChats.findIndex(c => c.id === id && c.userId === req.user.userId)
    
    if (chatIndex === -1) {
      return res.status(404).json({
        error: 'Chat Not Found',
        message: 'Chat not found or you do not have permission to access it'
      })
    }

    // Update chat
    mockChats[chatIndex] = {
      ...mockChats[chatIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    res.json({
      success: true,
      message: 'Chat updated successfully',
      data: mockChats[chatIndex]
    })
  } catch (error) {
    console.error('Error updating chat:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update chat'
    })
  }
})

// DELETE /api/chat/:id - Delete chat
router.delete('/:id', mockAuthMiddleware, [
  param('id').isString().withMessage('Invalid chat ID')
], async (req, res) => {
  try {
    const { id } = req.params
    
    const chatIndex = mockChats.findIndex(c => c.id === id && c.userId === req.user.userId)
    
    if (chatIndex === -1) {
      return res.status(404).json({
        error: 'Chat Not Found',
        message: 'Chat not found or you do not have permission to access it'
      })
    }

    // Remove chat
    mockChats.splice(chatIndex, 1)

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting chat:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete chat'
    })
  }
})

export default router