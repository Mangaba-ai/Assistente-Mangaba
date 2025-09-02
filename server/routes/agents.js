import express from 'express'
import { body, param, query, validationResult } from 'express-validator'
import Agent from '../models/Agent.js'
import Hub from '../models/Hub.js'
import { authMiddleware, ownershipMiddleware, hubAccessMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Validation rules
const createAgentValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Agent name must be between 1 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('hubId')
    .optional()
    .isMongoId()
    .withMessage('Invalid hub ID'),
  body('personality.type')
    .optional()
    .isIn(['helpful', 'creative', 'analytical', 'friendly', 'professional', 'casual', 'expert'])
    .withMessage('Invalid personality type'),
  body('personality.tone')
    .optional()
    .isIn(['formal', 'casual', 'friendly', 'professional', 'humorous', 'serious'])
    .withMessage('Invalid personality tone'),
  body('personality.expertise')
    .optional()
    .isArray()
    .withMessage('Expertise must be an array'),
  body('configuration.model')
    .optional()
    .isIn(['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'gemini-pro'])
    .withMessage('Invalid model'),
  body('configuration.temperature')
    .optional()
    .isFloat({ min: 0, max: 2 })
    .withMessage('Temperature must be between 0 and 2'),
  body('configuration.maxTokens')
    .optional()
    .isInt({ min: 1, max: 8000 })
    .withMessage('Max tokens must be between 1 and 8000'),
  body('configuration.systemPrompt')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('System prompt must not exceed 2000 characters')
]

const updateAgentValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Agent name must be between 1 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('personality')
    .optional()
    .isObject()
    .withMessage('Personality must be an object'),
  body('configuration')
    .optional()
    .isObject()
    .withMessage('Configuration must be an object'),
  body('prompts')
    .optional()
    .isObject()
    .withMessage('Prompts must be an object'),
  body('settings')
    .optional()
    .isObject()
    .withMessage('Settings must be an object')
]

const ratingValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment must not exceed 500 characters')
]

// @route   GET /api/agents
// @desc    Get agents (user's own + public)
// @access  Private
router.get('/', authMiddleware, [
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
  query('category')
    .optional()
    .isIn(['assistant', 'creative', 'analytical', 'educational', 'entertainment', 'productivity', 'other'])
    .withMessage('Invalid category'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('scope')
    .optional()
    .isIn(['own', 'public', 'all'])
    .withMessage('Scope must be own, public, or all')
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
    const { hubId, category, search, scope = 'all' } = req.query

    // Build query based on scope
    let query = { status: 'active' }

    if (scope === 'own') {
      query.userId = req.user.userId
    } else if (scope === 'public') {
      query['settings.isPublic'] = true
      query.userId = { $ne: req.user.userId }
    } else {
      // all: own agents + public agents
      query.$or = [
        { userId: req.user.userId },
        { 'settings.isPublic': true }
      ]
    }

    if (hubId) {
      query.hubId = hubId
    }

    if (category) {
      query['settings.category'] = category
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'personality.expertise': { $in: [new RegExp(search, 'i')] } }
      ]
    }

    // Get agents with pagination
    const [agents, total] = await Promise.all([
      Agent.find(query)
        .populate('userId', 'name avatar')
        .populate('hubId', 'name color icon')
        .sort({ 'usage.totalConversations': -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Agent.countDocuments(query)
    ])

    // Add user relationship info
    const agentsWithRelation = agents.map(agent => ({
      ...agent,
      isOwner: agent.userId._id.toString() === req.user.userId,
      canEdit: agent.userId._id.toString() === req.user.userId,
      canFork: agent.settings.allowFork || agent.userId._id.toString() === req.user.userId
    }))

    res.json({
      success: true,
      data: {
        agents: agentsWithRelation,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get agents error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while fetching agents'
    })
  }
})

// @route   POST /api/agents
// @desc    Create a new agent
// @access  Private
router.post('/', authMiddleware, createAgentValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        messages: errors.array().map(err => err.msg)
      })
    }

    const {
      name,
      description,
      hubId,
      avatar,
      personality,
      configuration,
      prompts,
      settings
    } = req.body

    // Verify hub access if hubId provided
    if (hubId) {
      const hub = await Hub.findById(hubId)
      if (!hub || !hub.hasAccess(req.user.userId, 'editor')) {
        return res.status(403).json({
          error: 'Access Forbidden',
          message: 'You do not have permission to create agents in this hub'
        })
      }
    }

    // Check if user has reached agent limit (free users: 10, premium: unlimited)
    const userAgentCount = await Agent.countDocuments({
      userId: req.user.userId,
      status: 'active'
    })

    if (req.user.subscription?.plan !== 'premium' && userAgentCount >= 10) {
      return res.status(403).json({
        error: 'Agent Limit Reached',
        message: 'Free users can create up to 10 agents. Upgrade to premium for unlimited agents.'
      })
    }

    // Create agent
    const agent = new Agent({
      name,
      description: description || '',
      userId: req.user.userId,
      hubId: hubId || null,
      avatar: avatar || null,
      personality: {
        type: personality?.type || 'helpful',
        tone: personality?.tone || 'friendly',
        expertise: personality?.expertise || []
      },
      configuration: {
        model: configuration?.model || 'gpt-3.5-turbo',
        temperature: configuration?.temperature || 0.7,
        maxTokens: configuration?.maxTokens || 2000,
        systemPrompt: configuration?.systemPrompt || '',
        contextWindow: configuration?.contextWindow || 4000,
        responseFormat: configuration?.responseFormat || 'text',
        capabilities: configuration?.capabilities || ['text']
      },
      prompts: {
        greeting: prompts?.greeting || `Hello! I'm ${name}, how can I help you today?`,
        examples: prompts?.examples || [],
        fallback: prompts?.fallback || "I'm sorry, I didn't understand that. Could you please rephrase?"
      },
      settings: {
        isPublic: settings?.isPublic || false,
        allowFork: settings?.allowFork || false,
        category: settings?.category || 'assistant',
        tags: settings?.tags || [],
        version: '1.0.0'
      }
    })

    await agent.save()

    // Populate references
    await agent.populate([
      { path: 'userId', select: 'name avatar' },
      { path: 'hubId', select: 'name color icon' }
    ])

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      data: {
        agent: {
          ...agent.toObject(),
          isOwner: true,
          canEdit: true,
          canFork: true
        }
      }
    })
  } catch (error) {
    console.error('Create agent error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while creating the agent'
    })
  }
})

// @route   GET /api/agents/popular
// @desc    Get popular public agents
// @access  Private
router.get('/popular', authMiddleware, [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('category')
    .optional()
    .isIn(['assistant', 'creative', 'analytical', 'educational', 'entertainment', 'productivity', 'other'])
    .withMessage('Invalid category')
], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const { category } = req.query

    const agents = await Agent.getPopular(limit, category)

    res.json({
      success: true,
      data: {
        agents
      }
    })
  } catch (error) {
    console.error('Get popular agents error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while fetching popular agents'
    })
  }
})

// @route   GET /api/agents/:id
// @desc    Get a specific agent
// @access  Private
router.get('/:id', authMiddleware, [
  param('id').isMongoId().withMessage('Invalid agent ID')
], async (req, res) => {
  try {
    const { id } = req.params

    const agent = await Agent.findOne({
      _id: id,
      $or: [
        { userId: req.user.userId },
        { 'settings.isPublic': true, status: 'active' }
      ]
    })
    .populate('userId', 'name avatar')
    .populate('hubId', 'name color icon')
    .populate('parentAgent', 'name userId')

    if (!agent) {
      return res.status(404).json({
        error: 'Agent Not Found',
        message: 'The specified agent was not found or you do not have access to it'
      })
    }

    // Check access permissions
    const isOwner = agent.userId._id.toString() === req.user.userId
    const canEdit = isOwner
    const canFork = agent.settings.allowFork || isOwner

    res.json({
      success: true,
      data: {
        agent: {
          ...agent.toObject(),
          isOwner,
          canEdit,
          canFork
        }
      }
    })
  } catch (error) {
    console.error('Get agent error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while fetching the agent'
    })
  }
})

// @route   PUT /api/agents/:id
// @desc    Update an agent
// @access  Private
router.put('/:id', authMiddleware, [
  param('id').isMongoId().withMessage('Invalid agent ID'),
  ...updateAgentValidation
], ownershipMiddleware(Agent), async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        messages: errors.array().map(err => err.msg)
      })
    }

    const agent = req.resource
    const allowedUpdates = [
      'name', 'description', 'avatar', 'personality', 'configuration',
      'prompts', 'settings'
    ]
    const updates = {}

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (typeof req.body[key] === 'object' && req.body[key] !== null) {
          // Merge objects instead of replacing
          updates[key] = { ...agent[key], ...req.body[key] }
        } else {
          updates[key] = req.body[key]
        }
      }
    })

    // Increment version if significant changes
    if (updates.personality || updates.configuration || updates.prompts) {
      const currentVersion = agent.settings.version.split('.')
      const minorVersion = parseInt(currentVersion[1]) + 1
      updates['settings.version'] = `${currentVersion[0]}.${minorVersion}.0`
    }

    Object.assign(agent, updates)
    await agent.save()

    res.json({
      success: true,
      message: 'Agent updated successfully',
      data: {
        agent
      }
    })
  } catch (error) {
    console.error('Update agent error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while updating the agent'
    })
  }
})

// @route   DELETE /api/agents/:id
// @desc    Delete an agent
// @access  Private
router.delete('/:id', authMiddleware, [
  param('id').isMongoId().withMessage('Invalid agent ID')
], ownershipMiddleware(Agent), async (req, res) => {
  try {
    const agent = req.resource
    agent.status = 'deleted'
    await agent.save()

    res.json({
      success: true,
      message: 'Agent deleted successfully'
    })
  } catch (error) {
    console.error('Delete agent error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while deleting the agent'
    })
  }
})

// @route   POST /api/agents/:id/fork
// @desc    Fork an agent
// @access  Private
router.post('/:id/fork', authMiddleware, [
  param('id').isMongoId().withMessage('Invalid agent ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Agent name must be between 1 and 50 characters'),
  body('hubId')
    .optional()
    .isMongoId()
    .withMessage('Invalid hub ID')
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
    const { name, hubId } = req.body

    // Find the original agent
    const originalAgent = await Agent.findOne({
      _id: id,
      $or: [
        { userId: req.user.userId },
        { 'settings.isPublic': true, 'settings.allowFork': true, status: 'active' }
      ]
    })

    if (!originalAgent) {
      return res.status(404).json({
        error: 'Agent Not Found',
        message: 'The specified agent was not found or cannot be forked'
      })
    }

    // Check if user can fork this agent
    const isOwner = originalAgent.userId.toString() === req.user.userId
    if (!isOwner && (!originalAgent.settings.isPublic || !originalAgent.settings.allowFork)) {
      return res.status(403).json({
        error: 'Fork Not Allowed',
        message: 'This agent cannot be forked'
      })
    }

    // Verify hub access if hubId provided
    if (hubId) {
      const hub = await Hub.findById(hubId)
      if (!hub || !hub.hasAccess(req.user.userId, 'editor')) {
        return res.status(403).json({
          error: 'Access Forbidden',
          message: 'You do not have permission to create agents in this hub'
        })
      }
    }

    // Check agent limit
    const userAgentCount = await Agent.countDocuments({
      userId: req.user.userId,
      status: 'active'
    })

    if (req.user.subscription?.plan !== 'premium' && userAgentCount >= 10) {
      return res.status(403).json({
        error: 'Agent Limit Reached',
        message: 'Free users can create up to 10 agents. Upgrade to premium for unlimited agents.'
      })
    }

    // Create fork
    const forkedAgent = await originalAgent.createFork(
      req.user.userId,
      name || `${originalAgent.name} (Fork)`,
      hubId
    )

    // Populate references
    await forkedAgent.populate([
      { path: 'userId', select: 'name avatar' },
      { path: 'hubId', select: 'name color icon' },
      { path: 'parentAgent', select: 'name userId' }
    ])

    res.status(201).json({
      success: true,
      message: 'Agent forked successfully',
      data: {
        agent: {
          ...forkedAgent.toObject(),
          isOwner: true,
          canEdit: true,
          canFork: true
        }
      }
    })
  } catch (error) {
    console.error('Fork agent error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while forking the agent'
    })
  }
})

// @route   POST /api/agents/:id/rate
// @desc    Rate an agent
// @access  Private
router.post('/:id/rate', authMiddleware, [
  param('id').isMongoId().withMessage('Invalid agent ID'),
  ...ratingValidation
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
    const { rating, comment } = req.body

    // Find the agent
    const agent = await Agent.findOne({
      _id: id,
      'settings.isPublic': true,
      status: 'active'
    })

    if (!agent) {
      return res.status(404).json({
        error: 'Agent Not Found',
        message: 'The specified agent was not found or is not public'
      })
    }

    // Users cannot rate their own agents
    if (agent.userId.toString() === req.user.userId) {
      return res.status(400).json({
        error: 'Cannot Rate Own Agent',
        message: 'You cannot rate your own agent'
      })
    }

    await agent.addRating(req.user.userId, rating, comment)

    res.json({
      success: true,
      message: 'Rating added successfully',
      data: {
        averageRating: agent.usage.averageRating,
        totalRatings: agent.usage.totalRatings
      }
    })
  } catch (error) {
    console.error('Rate agent error:', error)
    
    if (error.message === 'User has already rated this agent') {
      return res.status(400).json({
        error: 'Already Rated',
        message: 'You have already rated this agent'
      })
    }
    
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while rating the agent'
    })
  }
})

// @route   GET /api/agents/:id/forks
// @desc    Get agent forks
// @access  Private
router.get('/:id/forks', authMiddleware, [
  param('id').isMongoId().withMessage('Invalid agent ID'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const { id } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Verify agent exists and user has access
    const agent = await Agent.findOne({
      _id: id,
      $or: [
        { userId: req.user.userId },
        { 'settings.isPublic': true, status: 'active' }
      ]
    })

    if (!agent) {
      return res.status(404).json({
        error: 'Agent Not Found',
        message: 'The specified agent was not found or you do not have access to it'
      })
    }

    // Get forks
    const [forks, total] = await Promise.all([
      Agent.find({
        parentAgent: id,
        status: 'active',
        'settings.isPublic': true
      })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
      Agent.countDocuments({
        parentAgent: id,
        status: 'active',
        'settings.isPublic': true
      })
    ])

    res.json({
      success: true,
      data: {
        forks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get agent forks error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while fetching agent forks'
    })
  }
})

export default router