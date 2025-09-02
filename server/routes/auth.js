import express from 'express'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import { authMiddleware } from '../middleware/auth.js'
import rateLimit from 'express-rate-limit'

const router = express.Router()

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
})

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
]

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
]

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authLimiter, registerValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        messages: errors.array().map(err => err.msg)
      })
    }

    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        error: 'User Already Exists',
        message: 'A user with this email already exists'
      })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    })

    await user.save()

    // Generate token
    const token = generateToken(user._id)

    // Update last login
    await user.updateLastLogin()

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          preferences: user.preferences,
          subscription: user.subscription,
          emailVerified: user.emailVerified
        }
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      error: 'Registration Failed',
      message: 'An error occurred during registration'
    })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, loginValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        messages: errors.array().map(err => err.msg)
      })
    }

    const { email, password } = req.body

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Invalid email or password'
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account Disabled',
        message: 'Your account has been disabled. Please contact support.'
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Invalid email or password'
      })
    }

    // Generate token
    const token = generateToken(user._id)

    // Update last login
    await user.updateLastLogin()

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          preferences: user.preferences,
          subscription: user.subscription,
          emailVerified: user.emailVerified,
          lastLogin: user.lastLogin
        }
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      error: 'Login Failed',
      message: 'An error occurred during login'
    })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          preferences: user.preferences,
          subscription: user.subscription,
          emailVerified: user.emailVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while fetching user data'
    })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'system'])
    .withMessage('Theme must be light, dark, or system'),
  body('preferences.language')
    .optional()
    .isLength({ min: 2, max: 10 })
    .withMessage('Language code must be between 2 and 10 characters')
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

    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      })
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'preferences']
    const updates = {}
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'preferences') {
          updates.preferences = { ...user.preferences, ...req.body.preferences }
        } else {
          updates[key] = req.body[key]
        }
      }
    })

    Object.assign(user, updates)
    await user.save()

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          preferences: user.preferences,
          subscription: user.subscription
        }
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      error: 'Update Failed',
      message: 'An error occurred while updating profile'
    })
  }
})

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authMiddleware, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
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

    const { currentPassword, newPassword } = req.body

    // Find user with password
    const user = await User.findById(req.user.userId).select('+password')
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      })
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Invalid Password',
        message: 'Current password is incorrect'
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      error: 'Password Change Failed',
      message: 'An error occurred while changing password'
    })
  }
})

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found or inactive'
      })
    }

    // Generate new token
    const token = generateToken(user._id)

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token
      }
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(500).json({
      error: 'Token Refresh Failed',
      message: 'An error occurred while refreshing token'
    })
  }
})

export default router