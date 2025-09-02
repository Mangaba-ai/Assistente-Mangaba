import jwt from 'jsonwebtoken'

// Mock users storage (should match the one in auth-mock.js routes)
const mockUsers = new Map()

// Helper function to get mock user by ID
const getMockUserById = (userId) => {
  for (const [email, userData] of mockUsers.entries()) {
    if (userData.id === userId) {
      return userData
    }
  }
  return null
}

// Helper function to add mock user (for testing)
export const addMockUser = (email, userData) => {
  mockUsers.set(email, userData)
}

// Mock Authentication middleware
export const authMockMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'No token provided or invalid format'
      })
    }

    // Extract token
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'No token provided'
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    // For mock authentication, we'll create a default user if not found
    let user = getMockUserById(decoded.userId)
    
    if (!user) {
      // Create a default mock user for testing
      user = {
        id: decoded.userId,
        name: 'Usuário Teste',
        email: 'teste@mangaba.com',
        role: 'user',
        isActive: true,
        subscription: {
          plan: 'free'
        },
        preferences: {
          theme: 'system',
          language: 'pt-BR',
          notifications: true
        }
      }
      
      // Add to mock storage
      mockUsers.set(user.email, user)
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'User not found or inactive'
      })
    }

    // Add user info to request
    req.user = {
      userId: decoded.userId,
      role: user.role,
      subscription: user.subscription
    }

    next()
  } catch (error) {
    console.error('Auth mock middleware error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Token is invalid'
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Token has expired, please login again'
      })
    }

    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred during authentication'
    })
  }
}

// Admin middleware (mock version)
export const adminMockMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access Forbidden',
      message: 'Admin access required'
    })
  }
  next()
}

// Subscription middleware (mock version)
export const subscriptionMockMiddleware = (requiredPlan = 'free') => {
  return (req, res, next) => {
    const userPlan = req.user.subscription.plan
    const planHierarchy = { free: 1, pro: 2, enterprise: 3 }
    
    if (planHierarchy[userPlan] < planHierarchy[requiredPlan]) {
      return res.status(403).json({
        error: 'Subscription Required',
        message: `${requiredPlan} subscription or higher required`,
        requiredPlan,
        currentPlan: userPlan
      })
    }
    
    next()
  }
}

// Simple ownership middleware for mock (just check if user exists)
export const ownershipMockMiddleware = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      // For mock, we'll just pass through since we don't have real database
      // In a real scenario, you'd check if the resource belongs to the user
      next()
    } catch (error) {
      console.error('Ownership mock middleware error:', error)
      res.status(500).json({
        error: 'Server Error',
        message: 'An error occurred during ownership verification'
      })
    }
  }
}

// Hub access middleware (mock version)
export const hubAccessMockMiddleware = (requiredRole = 'viewer') => {
  return async (req, res, next) => {
    try {
      // For mock, we'll just pass through
      // In a real scenario, you'd check hub permissions
      next()
    } catch (error) {
      console.error('Hub access mock middleware error:', error)
      res.status(500).json({
        error: 'Server Error',
        message: 'An error occurred during hub access verification'
      })
    }
  }
}

export default {
  authMockMiddleware,
  adminMockMiddleware,
  subscriptionMockMiddleware,
  ownershipMockMiddleware,
  hubAccessMockMiddleware,
  addMockUser
}