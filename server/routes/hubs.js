import express from 'express'
import { body, param, query, validationResult } from 'express-validator'
import Hub from '../models/Hub.js'
import Chat from '../models/Chat.js'
import Agent from '../models/Agent.js'
import { authMiddleware, ownershipMiddleware, hubAccessMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Validation rules
const createHubValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Hub name must be between 1 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon must not exceed 50 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  body('category')
    .optional()
    .isIn(['work', 'personal', 'education', 'research', 'creative', 'other'])
    .withMessage('Invalid category')
]

const updateHubValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Hub name must be between 1 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon must not exceed 50 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  body('category')
    .optional()
    .isIn(['work', 'personal', 'education', 'research', 'creative', 'other'])
    .withMessage('Invalid category'),
  body('settings')
    .optional()
    .isObject()
    .withMessage('Settings must be an object')
]

const collaboratorValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('role')
    .isIn(['viewer', 'editor', 'admin'])
    .withMessage('Role must be viewer, editor, or admin')
]

// @route   GET /api/hubs
// @desc    Get user's hubs
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
  query('category')
    .optional()
    .isIn(['work', 'personal', 'education', 'research', 'creative', 'other'])
    .withMessage('Invalid category'),
  query('status')
    .optional()
    .isIn(['active', 'archived'])
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
    const { category, status = 'active' } = req.query

    // Build query for owned and collaborated hubs
    const query = {
      $or: [
        { userId: req.user.userId },
        { 'collaborators.userId': req.user.userId }
      ],
      status
    }

    if (category) {
      query.category = category
    }

    // Get hubs with pagination
    const [hubs, total] = await Promise.all([
      Hub.find(query)
        .populate('userId', 'name email avatar')
        .populate('collaborators.userId', 'name email avatar')
        .sort({ order: 1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Hub.countDocuments(query)
    ])

    // Add user role and permissions to each hub
    const hubsWithPermissions = hubs.map(hub => {
      const isOwner = hub.userId._id.toString() === req.user.userId
      const collaborator = hub.collaborators.find(
        c => c.userId._id.toString() === req.user.userId
      )
      
      return {
        ...hub,
        userRole: isOwner ? 'owner' : collaborator?.role || 'viewer',
        permissions: {
          canEdit: isOwner || collaborator?.role === 'admin' || collaborator?.role === 'editor',
          canDelete: isOwner,
          canManageCollaborators: isOwner || collaborator?.role === 'admin',
          canCreateChats: isOwner || collaborator?.role === 'admin' || collaborator?.role === 'editor'
        }
      }
    })

    res.json({
      success: true,
      data: {
        hubs: hubsWithPermissions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get hubs error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while fetching hubs'
    })
  }
})

// @route   POST /api/hubs
// @desc    Create a new hub
// @access  Private
router.post('/', authMiddleware, createHubValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        messages: errors.array().map(err => err.msg)
      })
    }

    const { name, description, icon, color, category } = req.body

    // Check if user has reached hub limit (free users: 5, premium: unlimited)
    const userHubCount = await Hub.countDocuments({
      userId: req.user.userId,
      status: 'active'
    })

    if (req.user.subscription?.plan !== 'premium' && userHubCount >= 5) {
      return res.status(403).json({
        error: 'Hub Limit Reached',
        message: 'Free users can create up to 5 hubs. Upgrade to premium for unlimited hubs.'
      })
    }

    // Create hub
    const hub = new Hub({
      name,
      description: description || '',
      userId: req.user.userId,
      icon: icon || 'folder',
      color: color || '#3B82F6',
      category: category || 'other'
    })

    await hub.save()

    // Populate user reference
    await hub.populate('userId', 'name email avatar')

    res.status(201).json({
      success: true,
      message: 'Hub created successfully',
      data: {
        hub: {
          ...hub.toObject(),
          userRole: 'owner',
          permissions: {
            canEdit: true,
            canDelete: true,
            canManageCollaborators: true,
            canCreateChats: true
          }
        }
      }
    })
  } catch (error) {
    console.error('Create hub error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while creating the hub'
    })
  }
})

// @route   GET /api/hubs/:id
// @desc    Get a specific hub
// @access  Private
router.get('/:id', authMiddleware, [
  param('id').isMongoId().withMessage('Invalid hub ID')
], hubAccessMiddleware('viewer'), async (req, res) => {
  try {
    const hub = req.hub

    // Get hub statistics
    const [chatCount, agentCount] = await Promise.all([
      Chat.countDocuments({ hubId: hub._id, status: 'active' }),
      Agent.countDocuments({ hubId: hub._id, status: 'active' })
    ])

    // Update statistics
    hub.statistics.chatCount = chatCount
    hub.statistics.agentCount = agentCount
    await hub.save()

    // Populate references
    await hub.populate([
      { path: 'userId', select: 'name email avatar' },
      { path: 'collaborators.userId', select: 'name email avatar' }
    ])

    // Determine user role and permissions
    const isOwner = hub.userId._id.toString() === req.user.userId
    const collaborator = hub.collaborators.find(
      c => c.userId._id.toString() === req.user.userId
    )
    const userRole = isOwner ? 'owner' : collaborator?.role || 'viewer'

    res.json({
      success: true,
      data: {
        hub: {
          ...hub.toObject(),
          userRole,
          permissions: {
            canEdit: isOwner || collaborator?.role === 'admin' || collaborator?.role === 'editor',
            canDelete: isOwner,
            canManageCollaborators: isOwner || collaborator?.role === 'admin',
            canCreateChats: isOwner || collaborator?.role === 'admin' || collaborator?.role === 'editor'
          }
        }
      }
    })
  } catch (error) {
    console.error('Get hub error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while fetching the hub'
    })
  }
})

// @route   PUT /api/hubs/:id
// @desc    Update a hub
// @access  Private
router.put('/:id', authMiddleware, [
  param('id').isMongoId().withMessage('Invalid hub ID'),
  ...updateHubValidation
], hubAccessMiddleware('editor'), async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        messages: errors.array().map(err => err.msg)
      })
    }

    const hub = req.hub
    const allowedUpdates = ['name', 'description', 'icon', 'color', 'category', 'settings', 'tags']
    const updates = {}

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'settings') {
          // Merge settings instead of replacing
          updates.settings = { ...hub.settings, ...req.body.settings }
        } else {
          updates[key] = req.body[key]
        }
      }
    })

    Object.assign(hub, updates)
    await hub.save()

    res.json({
      success: true,
      message: 'Hub updated successfully',
      data: {
        hub
      }
    })
  } catch (error) {
    console.error('Update hub error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while updating the hub'
    })
  }
})

// @route   DELETE /api/hubs/:id
// @desc    Delete a hub
// @access  Private
router.delete('/:id', authMiddleware, [
  param('id').isMongoId().withMessage('Invalid hub ID')
], ownershipMiddleware(Hub), async (req, res) => {
  try {
    const hub = req.resource

    // Archive all chats and agents in this hub
    await Promise.all([
      Chat.updateMany(
        { hubId: hub._id },
        { status: 'archived' }
      ),
      Agent.updateMany(
        { hubId: hub._id },
        { status: 'archived' }
      )
    ])

    // Archive the hub
    hub.status = 'archived'
    await hub.save()

    res.json({
      success: true,
      message: 'Hub deleted successfully'
    })
  } catch (error) {
    console.error('Delete hub error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while deleting the hub'
    })
  }
})

// @route   POST /api/hubs/:id/collaborators
// @desc    Add a collaborator to a hub
// @access  Private
router.post('/:id/collaborators', authMiddleware, [
  param('id').isMongoId().withMessage('Invalid hub ID'),
  ...collaboratorValidation
], hubAccessMiddleware('admin'), async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        messages: errors.array().map(err => err.msg)
      })
    }

    const hub = req.hub
    const { email, role } = req.body

    // Find user by email
    const User = (await import('../models/User.js')).default
    const user = await User.findOne({ email })
    
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'No user found with this email address'
      })
    }

    // Check if user is already a collaborator
    const existingCollaborator = hub.collaborators.find(
      c => c.userId.toString() === user._id.toString()
    )

    if (existingCollaborator) {
      return res.status(400).json({
        error: 'Already Collaborator',
        message: 'This user is already a collaborator on this hub'
      })
    }

    // Check if user is the owner
    if (hub.userId.toString() === user._id.toString()) {
      return res.status(400).json({
        error: 'Cannot Add Owner',
        message: 'Cannot add the hub owner as a collaborator'
      })
    }

    // Add collaborator
    await hub.addCollaborator(user._id, role)

    // Populate the new collaborator
    await hub.populate('collaborators.userId', 'name email avatar')

    const newCollaborator = hub.collaborators.find(
      c => c.userId._id.toString() === user._id.toString()
    )

    res.status(201).json({
      success: true,
      message: 'Collaborator added successfully',
      data: {
        collaborator: newCollaborator
      }
    })
  } catch (error) {
    console.error('Add collaborator error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while adding the collaborator'
    })
  }
})

// @route   PUT /api/hubs/:id/collaborators/:userId
// @desc    Update a collaborator's role
// @access  Private
router.put('/:id/collaborators/:userId', authMiddleware, [
  param('id').isMongoId().withMessage('Invalid hub ID'),
  param('userId').isMongoId().withMessage('Invalid user ID'),
  body('role')
    .isIn(['viewer', 'editor', 'admin'])
    .withMessage('Role must be viewer, editor, or admin')
], hubAccessMiddleware('admin'), async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        messages: errors.array().map(err => err.msg)
      })
    }

    const hub = req.hub
    const { userId } = req.params
    const { role } = req.body

    await hub.updateCollaboratorRole(userId, role)

    res.json({
      success: true,
      message: 'Collaborator role updated successfully'
    })
  } catch (error) {
    console.error('Update collaborator error:', error)
    
    if (error.message === 'Collaborator not found') {
      return res.status(404).json({
        error: 'Collaborator Not Found',
        message: 'The specified collaborator was not found'
      })
    }
    
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while updating the collaborator'
    })
  }
})

// @route   DELETE /api/hubs/:id/collaborators/:userId
// @desc    Remove a collaborator from a hub
// @access  Private
router.delete('/:id/collaborators/:userId', authMiddleware, [
  param('id').isMongoId().withMessage('Invalid hub ID'),
  param('userId').isMongoId().withMessage('Invalid user ID')
], hubAccessMiddleware('admin'), async (req, res) => {
  try {
    const hub = req.hub
    const { userId } = req.params

    await hub.removeCollaborator(userId)

    res.json({
      success: true,
      message: 'Collaborator removed successfully'
    })
  } catch (error) {
    console.error('Remove collaborator error:', error)
    
    if (error.message === 'Collaborator not found') {
      return res.status(404).json({
        error: 'Collaborator Not Found',
        message: 'The specified collaborator was not found'
      })
    }
    
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while removing the collaborator'
    })
  }
})

// @route   PUT /api/hubs/reorder
// @desc    Reorder user's hubs
// @access  Private
router.put('/reorder', authMiddleware, [
  body('hubIds')
    .isArray({ min: 1 })
    .withMessage('Hub IDs must be a non-empty array'),
  body('hubIds.*')
    .isMongoId()
    .withMessage('Each hub ID must be valid')
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

    const { hubIds } = req.body

    // Verify all hubs belong to the user
    const hubs = await Hub.find({
      _id: { $in: hubIds },
      userId: req.user.userId
    })

    if (hubs.length !== hubIds.length) {
      return res.status(403).json({
        error: 'Access Forbidden',
        message: 'You can only reorder your own hubs'
      })
    }

    // Update order for each hub
    const updatePromises = hubIds.map((hubId, index) => 
      Hub.findByIdAndUpdate(hubId, { order: index })
    )

    await Promise.all(updatePromises)

    res.json({
      success: true,
      message: 'Hubs reordered successfully'
    })
  } catch (error) {
    console.error('Reorder hubs error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while reordering hubs'
    })
  }
})

export default router