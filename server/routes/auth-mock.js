import express from 'express'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'

const router = express.Router()

// Mock users storage (in-memory for testing)
const mockUsers = new Map()

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
// @desc    Register new user (mock)
// @access  Public
router.post('/register', registerValidation, async (req, res) => {
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
    if (mockUsers.has(email)) {
      return res.status(400).json({
        error: 'User Already Exists',
        message: 'A user with this email already exists'
      })
    }

    // Create mock user
    const userId = Date.now().toString()
    const user = {
      id: userId,
      name,
      email,
      role: 'user',
      preferences: {
        theme: 'system',
        language: 'pt-BR',
        notifications: true
      },
      subscription: {
        plan: 'free'
      },
      emailVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }

    mockUsers.set(email, { ...user, password })

    // Generate token
    const token = generateToken(userId)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user
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
// @desc    Login user (mock)
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
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

    // Find user
    const userData = mockUsers.get(email)
    if (!userData || userData.password !== password) {
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Invalid email or password'
      })
    }

    // Check if user is active
    if (!userData.isActive) {
      return res.status(401).json({
        error: 'Account Disabled',
        message: 'Your account has been disabled. Please contact support.'
      })
    }

    // Update last login
    userData.lastLoginAt = new Date().toISOString()
    mockUsers.set(email, userData)

    // Generate token
    const token = generateToken(userData.id)

    // Remove password from response
    const { password: _, ...user } = userData

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user
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

// @route   GET /api/auth/profile
// @desc    Get user profile (mock)
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    // Find user by ID
    let user = null
    for (const userData of mockUsers.values()) {
      if (userData.id === decoded.userId) {
        user = userData
        break
      }
    }
    
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      })
    }

    // Remove password from response
    const { password: _, ...userProfile } = user

    res.json({
      success: true,
      data: { user: userProfile }
    })
  } catch (error) {
    console.error('Profile error:', error)
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    })
  }
})

// @route   POST /api/auth/verify-token
// @desc    Verify JWT token (mock)
// @access  Private
router.post('/verify-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    // Find user by ID
    let user = null
    for (const userData of mockUsers.values()) {
      if (userData.id === decoded.userId) {
        user = userData
        break
      }
    }
    
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      message: 'Token is valid',
      data: { valid: true, userId: decoded.userId }
    })
  } catch (error) {
    console.error('Token verification error:', error)
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile (mock)
// @access  Private
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    // Find user by ID
    let userEmail = null
    let user = null
    for (const [email, userData] of mockUsers.entries()) {
      if (userData.id === decoded.userId) {
        userEmail = email
        user = userData
        break
      }
    }
    
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      })
    }

    // Update user data
    const { name, preferences } = req.body
    if (name) user.name = name
    if (preferences) user.preferences = { ...user.preferences, ...preferences }
    user.updatedAt = new Date().toISOString()

    // Save updated user
    mockUsers.set(userEmail, user)

    // Remove password from response
    const { password: _, ...userProfile } = user

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: userProfile }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    })
  }
})

// @route   POST /api/auth/logout
// @desc    Logout user (mock)
// @access  Private
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  })
})

export default router