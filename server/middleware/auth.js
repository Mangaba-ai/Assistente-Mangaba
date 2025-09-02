import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Authentication middleware
export const authMiddleware = async (req, res, next) => {
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
    
    // Check if user exists and is active
    const user = await User.findById(decoded.userId)
    if (!user || !user.isActive) {
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
    console.error('Auth middleware error:', error)
    
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

// Admin middleware
export const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access Forbidden',
      message: 'Admin access required'
    })
  }
  next()
}

// Subscription middleware
export const subscriptionMiddleware = (requiredPlan = 'free') => {
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

// Resource ownership middleware
export const ownershipMiddleware = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam]
      const resource = await resourceModel.findById(resourceId)
      
      if (!resource) {
        return res.status(404).json({
          error: 'Resource Not Found',
          message: 'The requested resource was not found'
        })
      }
      
      // Check ownership
      if (resource.userId.toString() !== req.user.userId) {
        return res.status(403).json({
          error: 'Access Forbidden',
          message: 'You do not have permission to access this resource'
        })
      }
      
      // Add resource to request for use in route handler
      req.resource = resource
      next()
    } catch (error) {
      console.error('Ownership middleware error:', error)
      res.status(500).json({
        error: 'Server Error',
        message: 'An error occurred while checking resource ownership'
      })
    }
  }
}

// Hub access middleware (for collaborators)
export const hubAccessMiddleware = (requiredRole = 'viewer') => {
  return async (req, res, next) => {
    try {
      const hubId = req.params.hubId || req.body.hubId
      
      if (!hubId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Hub ID is required'
        })
      }
      
      const Hub = (await import('../models/Hub.js')).default
      const hub = await Hub.findById(hubId)
      
      if (!hub) {
        return res.status(404).json({
          error: 'Hub Not Found',
          message: 'The requested hub was not found'
        })
      }
      
      // Check access
      if (!hub.hasAccess(req.user.userId, requiredRole)) {
        return res.status(403).json({
          error: 'Access Forbidden',
          message: `${requiredRole} access or higher required for this hub`
        })
      }
      
      req.hub = hub
      next()
    } catch (error) {
      console.error('Hub access middleware error:', error)
      res.status(500).json({
        error: 'Server Error',
        message: 'An error occurred while checking hub access'
      })
    }
  }
}

// Rate limiting by user
export const userRateLimitMiddleware = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map()
  
  return (req, res, next) => {
    const userId = req.user.userId
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Get user's request history
    let userRequestHistory = userRequests.get(userId) || []
    
    // Remove old requests outside the window
    userRequestHistory = userRequestHistory.filter(timestamp => timestamp > windowStart)
    
    // Check if user has exceeded the limit
    if (userRequestHistory.length >= maxRequests) {
      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((userRequestHistory[0] + windowMs - now) / 1000)
      })
    }
    
    // Add current request
    userRequestHistory.push(now)
    userRequests.set(userId, userRequestHistory)
    
    next()
  }
}

// Feature access middleware
export const featureAccessMiddleware = (feature) => {
  return (req, res, next) => {
    const userFeatures = req.user.subscription.features
    
    if (!userFeatures[feature]) {
      return res.status(403).json({
        error: 'Feature Not Available',
        message: `The ${feature} feature is not available in your current subscription`,
        feature,
        currentPlan: req.user.subscription.plan
      })
    }
    
    next()
  }
}