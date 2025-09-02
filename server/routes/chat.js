import express from 'express'
import { body, param, query, validationResult } from 'express-validator'
import Chat from '../models/Chat.js'
import Agent from '../models/Agent.js'
import Hub from '../models/Hub.js'
import { authMiddleware, ownershipMiddleware, hubAccessMiddleware } from '../middleware/auth.js'
import { authMockMiddleware, ownershipMockMiddleware, hubAccessMockMiddleware } from '../middleware/auth-mock.js'

// Use mock middleware for development/testing
const useAuth = process.env.NODE_ENV === 'production' ? authMiddleware : authMockMiddleware
const useOwnership = process.env.NODE_ENV === 'production' ? ownershipMiddleware : ownershipMockMiddleware
const useHubAccess = process.env.NODE_ENV === 'production' ? hubAccessMiddleware : hubAccessMockMiddleware

const router = express.Router()

// Validation rules
const createChatValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('hubId')
    .optional()
    .isMongoId()
    .withMessage('Invalid hub ID'),
  body('agentId')
    .optional()
    .isMongoId()
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

// @route   GET /api/chat
// @desc    Get user's chats
// @access  Private
router.get('/', useAuth, [
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
    .isMongoId()
    .withMessage('Invalid hub ID'),
  query('status')
    .optional()
    .isIn(['active', 'archived', 'deleted'])
    .withMessage('Invalid status')
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

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit
    const { hubId, status = 'active' } = req.query

    // Build query
    const query = {
      userId: req.user.userId,
      status
    }

    if (hubId) {
      query.hubId = hubId
    }

    // Get chats with pagination
    const [chats, total] = await Promise.all([
      Chat.find(query)
        .populate('hubId', 'name color icon')
        .populate('agentId', 'name avatar personality.type')
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Chat.countDocuments(query)
    ])

    // Add last message preview to each chat
    const chatsWithPreview = chats.map(chat => ({
      ...chat,
      lastMessage: chat.messages.length > 0 ? {
        content: chat.messages[chat.messages.length - 1].content.substring(0, 100),
        role: chat.messages[chat.messages.length - 1].role,
        createdAt: chat.messages[chat.messages.length - 1].createdAt
      } : null,
      messageCount: chat.messages.length
    }))

    res.json({
      success: true,
      data: {
        chats: chatsWithPreview,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get chats error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while fetching chats'
    })
  }
})

// @route   POST /api/chat
// @desc    Create a new chat
// @access  Private
router.post('/', useAuth, createChatValidation, async (req, res) => {
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

    // Verify hub access if hubId provided
    if (hubId) {
      const hub = await Hub.findById(hubId)
      if (!hub || !hub.hasAccess(req.user.userId, 'editor')) {
        return res.status(403).json({
          error: 'Access Forbidden',
          message: 'You do not have permission to create chats in this hub'
        })
      }
    }

    // Verify agent access if agentId provided
    if (agentId) {
      const agent = await Agent.findById(agentId)
      if (!agent || (agent.userId.toString() !== req.user.userId && !agent.settings.isPublic)) {
        return res.status(403).json({
          error: 'Access Forbidden',
          message: 'You do not have permission to use this agent'
        })
      }
    }

    // Create chat
    const chat = new Chat({
      title,
      userId: req.user.userId,
      hubId: hubId || null,
      agentId: agentId || null
    })

    await chat.save()

    // Populate references
    await chat.populate([
      { path: 'hubId', select: 'name color icon' },
      { path: 'agentId', select: 'name avatar personality.type' }
    ])

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: {
        chat
      }
    })
  } catch (error) {
    console.error('Create chat error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while creating the chat'
    })
  }
})

// @route   GET /api/chat/:id
// @desc    Get a specific chat
// @access  Private
router.get('/:id', useAuth, [
  param('id').isMongoId().withMessage('Invalid chat ID')
], useOwnership(Chat), async (req, res) => {
  try {
    const chat = req.resource

    // Populate references
    await chat.populate([
      { path: 'hubId', select: 'name color icon' },
      { path: 'agentId', select: 'name avatar personality configuration' }
    ])

    res.json({
      success: true,
      data: {
        chat
      }
    })
  } catch (error) {
    console.error('Get chat error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while fetching the chat'
    })
  }
})

// @route   PUT /api/chat/:id
// @desc    Update a chat
// @access  Private
router.put('/:id', useAuth, [
  param('id').isMongoId().withMessage('Invalid chat ID'),
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
], useOwnership(Chat), async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        messages: errors.array().map(err => err.msg)
      })
    }

    const chat = req.resource
    const allowedUpdates = ['title', 'tags', 'status']
    const updates = {}

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key]
      }
    })

    Object.assign(chat, updates)
    await chat.save()

    res.json({
      success: true,
      message: 'Chat updated successfully',
      data: {
        chat
      }
    })
  } catch (error) {
    console.error('Update chat error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while updating the chat'
    })
  }
})

// @route   DELETE /api/chat/:id
// @desc    Delete a chat
// @access  Private
router.delete('/:id', useAuth, [
  param('id').isMongoId().withMessage('Invalid chat ID')
], useOwnership(Chat), async (req, res) => {
  try {
    const chat = req.resource
    chat.status = 'deleted'
    await chat.save()

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    })
  } catch (error) {
    console.error('Delete chat error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while deleting the chat'
    })
  }
})

// @route   POST /api/chat/:id/messages
// @desc    Add a message to a chat
// @access  Private
router.post('/:id/messages', useAuth, [
  param('id').isMongoId().withMessage('Invalid chat ID'),
  ...messageValidation
], useOwnership(Chat), async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        messages: errors.array().map(err => err.msg)
      })
    }

    const chat = req.resource
    const { content, role, attachments = [], metadata = {} } = req.body

    // Create message
    const message = {
      content,
      role,
      attachments,
      metadata: {
        tokens: metadata.tokens || 0,
        processingTime: metadata.processingTime || 0,
        model: metadata.model || null,
        temperature: metadata.temperature || 0.7
      }
    }

    await chat.addMessage(message)

    // Update agent usage if message is from assistant
    if (role === 'assistant' && chat.agentId) {
      const agent = await Agent.findById(chat.agentId)
      if (agent) {
        await agent.updateUsage(1, metadata.tokens || 0)
      }
    }

    res.status(201).json({
      success: true,
      message: 'Message added successfully',
      data: {
        message: chat.messages[chat.messages.length - 1]
      }
    })
  } catch (error) {
    console.error('Add message error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while adding the message'
    })
  }
})

// @route   PUT /api/chat/:id/messages/:messageId
// @desc    Update a message
// @access  Private
router.put('/:id/messages/:messageId', useAuth, [
  param('id').isMongoId().withMessage('Invalid chat ID'),
  param('messageId').isMongoId().withMessage('Invalid message ID'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Message content must be between 1 and 10000 characters')
], useOwnership(Chat), async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        messages: errors.array().map(err => err.msg)
      })
    }

    const chat = req.resource
    const { messageId } = req.params
    const { content } = req.body

    await chat.updateMessage(messageId, { content })

    res.json({
      success: true,
      message: 'Message updated successfully'
    })
  } catch (error) {
    console.error('Update message error:', error)
    
    if (error.message === 'Message not found') {
      return res.status(404).json({
        error: 'Message Not Found',
        message: 'The specified message was not found'
      })
    }
    
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while updating the message'
    })
  }
})

// @route   DELETE /api/chat/:id/messages/:messageId
// @desc    Delete a message
// @access  Private
router.delete('/:id/messages/:messageId', useAuth, [
  param('id').isMongoId().withMessage('Invalid chat ID'),
  param('messageId').isMongoId().withMessage('Invalid message ID')
], useOwnership(Chat), async (req, res) => {
  try {
    const chat = req.resource
    const { messageId } = req.params

    await chat.deleteMessage(messageId)

    res.json({
      success: true,
      message: 'Message deleted successfully'
    })
  } catch (error) {
    console.error('Delete message error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while deleting the message'
    })
  }
})

// @route   POST /api/chat/:id/share
// @desc    Generate share token for chat
// @access  Private
router.post('/:id/share', useAuth, [
  param('id').isMongoId().withMessage('Invalid chat ID'),
  body('allowComments')
    .optional()
    .isBoolean()
    .withMessage('Allow comments must be a boolean'),
  body('expiresIn')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Expires in must be a positive integer (days)')
], useOwnership(Chat), async (req, res) => {
  try {
    const chat = req.resource
    const { allowComments = false, expiresIn } = req.body

    // Set share settings
    chat.shareSettings.allowComments = allowComments
    if (expiresIn) {
      chat.shareSettings.expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000)
    }

    await chat.generateShareToken()

    res.json({
      success: true,
      message: 'Share token generated successfully',
      data: {
        shareToken: chat.shareToken,
        shareUrl: `${process.env.FRONTEND_URL}/shared/${chat.shareToken}`,
        expiresAt: chat.shareSettings.expiresAt
      }
    })
  } catch (error) {
    console.error('Generate share token error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while generating share token'
    })
  }
})

// @route   GET /api/chat/shared/:token
// @desc    Get shared chat
// @access  Public
router.get('/shared/:token', [
  param('token').isLength({ min: 10 }).withMessage('Invalid share token')
], async (req, res) => {
  try {
    const { token } = req.params

    const chat = await Chat.findOne({
      shareToken: token,
      isShared: true,
      status: 'active'
    })
    .populate('agentId', 'name avatar personality')
    .populate('userId', 'name avatar')

    if (!chat) {
      return res.status(404).json({
        error: 'Chat Not Found',
        message: 'The shared chat was not found or has expired'
      })
    }

    // Check if share has expired
    if (chat.shareSettings.expiresAt && chat.shareSettings.expiresAt < new Date()) {
      return res.status(410).json({
        error: 'Share Expired',
        message: 'This shared chat has expired'
      })
    }

    // Remove sensitive information
    const sanitizedChat = {
      _id: chat._id,
      title: chat.title,
      messages: chat.messages,
      agentId: chat.agentId,
      owner: chat.userId,
      createdAt: chat.createdAt,
      shareSettings: chat.shareSettings
    }

    res.json({
      success: true,
      data: {
        chat: sanitizedChat
      }
    })
  } catch (error) {
    console.error('Get shared chat error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while fetching the shared chat'
    })
  }
})

export default router