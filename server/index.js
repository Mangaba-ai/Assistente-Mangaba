import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Import in-memory routes only (no database required)
import authMockRoutes from './routes/auth-mock.js'
import chatMockRoutes from './routes/chat-mock.js'
import hubMockRoutes from './routes/hubs-mock.js'
import agentMockRoutes from './routes/agents-mock.js'
import uploadRoutes from './routes/uploads.js'
import ollamaRoutes from './routes/ollama.js'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

// Middleware
app.use(helmet())
app.use(compression())
app.use(morgan('combined'))
app.use(limiter)
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3000'
  ],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Routes and error handlers will be configured in startServer function

// No database connection needed - platform runs 100% in memory

// Start server
const startServer = async () => {
  try {
    // Platform configured for 100% in-memory operation (no database persistence)
    console.log('🚀 Platform running in full memory mode - no data persistence')
    console.log('💾 All data stored in session cache only')
    
    // Always use in-memory routes (no database required)
    app.use('/api/auth', authMockRoutes)
    app.use('/api/hubs', hubMockRoutes)
    app.use('/api/agents', agentMockRoutes)
    app.use('/api/chat', chatMockRoutes)
    app.use('/api/uploads', uploadRoutes)
    app.use('/api/ollama', ollamaRoutes)
    
    // 404 handler - must be after all routes
    app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        message: `The requested route ${req.originalUrl} does not exist.`
      })
    })

    // Global error handler - must be last
    app.use((err, req, res, next) => {
      console.error('Error:', err)
      
      // Mongoose validation error
      if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message)
        return res.status(400).json({
          error: 'Validation Error',
          messages: errors
        })
      }
      
      // Mongoose duplicate key error
      if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0]
        return res.status(400).json({
          error: 'Duplicate Error',
          message: `${field} already exists`
        })
      }
      
      // JWT errors
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Invalid Token',
          message: 'Please provide a valid token'
        })
      }
      
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token Expired',
          message: 'Please login again'
        })
      }
      
      // Default error
      res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' 
          ? 'Something went wrong' 
          : err.message
      })
    })
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3001'}`)
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`)
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...')
  console.log('💾 Session data cleared from memory')
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...')
  console.log('💾 Session data cleared from memory')
  process.exit(0)
})

export default app