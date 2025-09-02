import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import { body, param, query, validationResult } from 'express-validator'
import { authMiddleware, subscriptionMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', req.user.userId)
    try {
      await fs.mkdir(uploadDir, { recursive: true })
      cb(null, uploadDir)
    } catch (error) {
      cb(error)
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
    cb(null, `${name}-${uniqueSuffix}${ext}`)
  }
})

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    // Images
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    // Documents
    'application/pdf': '.pdf',
    'text/plain': '.txt',
    'text/markdown': '.md',
    'application/json': '.json',
    'text/csv': '.csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    // Code files
    'text/javascript': '.js',
    'text/typescript': '.ts',
    'text/html': '.html',
    'text/css': '.css',
    'application/python': '.py',
    'text/x-python': '.py'
  }

  if (allowedTypes[file.mimetype]) {
    cb(null, true)
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false)
  }
}

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  }
})

// Helper function to analyze file content
const analyzeFile = async (filePath, mimetype, originalname) => {
  const analysis = {
    type: 'unknown',
    content: null,
    metadata: {},
    summary: null
  }

  try {
    if (mimetype.startsWith('text/') || mimetype === 'application/json') {
      // Text-based files
      const content = await fs.readFile(filePath, 'utf-8')
      analysis.type = 'text'
      analysis.content = content
      analysis.metadata = {
        lineCount: content.split('\n').length,
        characterCount: content.length,
        wordCount: content.split(/\s+/).filter(word => word.length > 0).length
      }
      analysis.summary = `Text file with ${analysis.metadata.lineCount} lines and ${analysis.metadata.wordCount} words`
    } else if (mimetype.startsWith('image/')) {
      // Image files
      analysis.type = 'image'
      analysis.metadata = {
        format: path.extname(originalname).toLowerCase().slice(1)
      }
      analysis.summary = `Image file in ${analysis.metadata.format.toUpperCase()} format`
      
      // For actual image analysis, you would integrate with services like:
      // - Google Vision API
      // - AWS Rekognition
      // - Azure Computer Vision
      // For now, we'll provide a placeholder
      analysis.content = 'Image analysis would be performed here with AI vision services'
    } else if (mimetype === 'application/pdf') {
      // PDF files
      analysis.type = 'document'
      analysis.summary = 'PDF document (text extraction would be performed here)'
      // For actual PDF processing, you would use libraries like:
      // - pdf-parse
      // - pdf2pic for image extraction
    } else {
      analysis.summary = `File of type ${mimetype}`
    }
  } catch (error) {
    console.error('File analysis error:', error)
    analysis.summary = 'Error analyzing file content'
  }

  return analysis
}

// @route   POST /api/uploads
// @desc    Upload files
// @access  Private
router.post('/', authMiddleware, subscriptionMiddleware(['free', 'premium']), (req, res) => {
  upload.array('files', 5)(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File Too Large',
          message: 'File size must be less than 10MB'
        })
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          error: 'Too Many Files',
          message: 'Maximum 5 files allowed per upload'
        })
      }
      return res.status(400).json({
        error: 'Upload Error',
        message: err.message
      })
    } else if (err) {
      return res.status(400).json({
        error: 'Upload Error',
        message: err.message
      })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No Files',
        message: 'No files were uploaded'
      })
    }

    try {
      // Process each uploaded file
      const processedFiles = await Promise.all(
        req.files.map(async (file) => {
          const analysis = await analyzeFile(file.path, file.mimetype, file.originalname)
          
          return {
            id: path.basename(file.filename, path.extname(file.filename)),
            originalName: file.originalname,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            url: `/api/uploads/files/${req.user.userId}/${file.filename}`,
            analysis,
            uploadedAt: new Date()
          }
        })
      )

      res.status(201).json({
        success: true,
        message: `${processedFiles.length} file(s) uploaded successfully`,
        data: {
          files: processedFiles
        }
      })
    } catch (error) {
      console.error('File processing error:', error)
      
      // Clean up uploaded files on error
      await Promise.all(
        req.files.map(file => 
          fs.unlink(file.path).catch(console.error)
        )
      )
      
      res.status(500).json({
        error: 'Processing Error',
        message: 'An error occurred while processing the uploaded files'
      })
    }
  })
})

// @route   GET /api/uploads/files/:userId/:filename
// @desc    Serve uploaded files
// @access  Private
router.get('/files/:userId/:filename', authMiddleware, [
  param('userId').isMongoId().withMessage('Invalid user ID'),
  param('filename').matches(/^[\w\-. ]+$/).withMessage('Invalid filename')
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

    const { userId, filename } = req.params

    // Users can only access their own files
    if (userId !== req.user.userId) {
      return res.status(403).json({
        error: 'Access Forbidden',
        message: 'You can only access your own files'
      })
    }

    const filePath = path.join(process.cwd(), 'uploads', userId, filename)
    
    try {
      await fs.access(filePath)
    } catch {
      return res.status(404).json({
        error: 'File Not Found',
        message: 'The requested file was not found'
      })
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase()
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.md': 'text/markdown',
      '.json': 'application/json',
      '.csv': 'text/csv',
      '.js': 'text/javascript',
      '.ts': 'text/typescript',
      '.html': 'text/html',
      '.css': 'text/css',
      '.py': 'text/x-python'
    }

    const contentType = mimeTypes[ext] || 'application/octet-stream'
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(filename)}"`)

    // Stream the file
    res.sendFile(path.resolve(filePath))
  } catch (error) {
    console.error('Serve file error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while serving the file'
    })
  }
})

// @route   DELETE /api/uploads/files/:userId/:filename
// @desc    Delete uploaded file
// @access  Private
router.delete('/files/:userId/:filename', authMiddleware, [
  param('userId').isMongoId().withMessage('Invalid user ID'),
  param('filename').matches(/^[\w\-. ]+$/).withMessage('Invalid filename')
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

    const { userId, filename } = req.params

    // Users can only delete their own files
    if (userId !== req.user.userId) {
      return res.status(403).json({
        error: 'Access Forbidden',
        message: 'You can only delete your own files'
      })
    }

    const filePath = path.join(process.cwd(), 'uploads', userId, filename)
    
    try {
      await fs.unlink(filePath)
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({
          error: 'File Not Found',
          message: 'The requested file was not found'
        })
      }
      throw error
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (error) {
    console.error('Delete file error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while deleting the file'
    })
  }
})

// @route   GET /api/uploads/user/:userId
// @desc    Get user's uploaded files
// @access  Private
router.get('/user/:userId', authMiddleware, [
  param('userId').isMongoId().withMessage('Invalid user ID'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('type')
    .optional()
    .isIn(['image', 'document', 'text', 'all'])
    .withMessage('Type must be image, document, text, or all')
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

    const { userId } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const { type = 'all' } = req.query

    // Users can only access their own files
    if (userId !== req.user.userId) {
      return res.status(403).json({
        error: 'Access Forbidden',
        message: 'You can only access your own files'
      })
    }

    const userUploadDir = path.join(process.cwd(), 'uploads', userId)
    
    try {
      await fs.access(userUploadDir)
    } catch {
      return res.json({
        success: true,
        data: {
          files: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0
          }
        }
      })
    }

    // Read directory and get file stats
    const files = await fs.readdir(userUploadDir)
    const fileDetails = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(userUploadDir, filename)
        const stats = await fs.stat(filePath)
        const ext = path.extname(filename).toLowerCase()
        
        // Determine file type
        let fileType = 'other'
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
          fileType = 'image'
        } else if (['.pdf', '.docx', '.xlsx', '.pptx'].includes(ext)) {
          fileType = 'document'
        } else if (['.txt', '.md', '.json', '.csv', '.js', '.ts', '.html', '.css', '.py'].includes(ext)) {
          fileType = 'text'
        }
        
        return {
          filename,
          originalName: filename, // In a real app, you'd store this mapping
          size: stats.size,
          type: fileType,
          mimetype: getMimeType(ext),
          url: `/api/uploads/files/${userId}/${filename}`,
          uploadedAt: stats.birthtime,
          modifiedAt: stats.mtime
        }
      })
    )

    // Filter by type if specified
    let filteredFiles = fileDetails
    if (type !== 'all') {
      filteredFiles = fileDetails.filter(file => file.type === type)
    }

    // Sort by upload date (newest first)
    filteredFiles.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))

    // Paginate
    const total = filteredFiles.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedFiles = filteredFiles.slice(startIndex, endIndex)

    res.json({
      success: true,
      data: {
        files: paginatedFiles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get user files error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while fetching user files'
    })
  }
})

// Helper function to get MIME type from extension
function getMimeType(ext) {
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.json': 'application/json',
    '.csv': 'text/csv',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.js': 'text/javascript',
    '.ts': 'text/typescript',
    '.html': 'text/html',
    '.css': 'text/css',
    '.py': 'text/x-python'
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

// @route   POST /api/uploads/analyze
// @desc    Analyze uploaded file content
// @access  Private
router.post('/analyze', authMiddleware, [
  body('fileUrl')
    .isURL()
    .withMessage('Valid file URL is required'),
  body('analysisType')
    .optional()
    .isIn(['content', 'metadata', 'full'])
    .withMessage('Analysis type must be content, metadata, or full')
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

    const { fileUrl, analysisType = 'full' } = req.body

    // Extract filename and userId from URL
    const urlParts = fileUrl.split('/')
    const filename = urlParts[urlParts.length - 1]
    const userId = urlParts[urlParts.length - 2]

    // Verify user can access this file
    if (userId !== req.user.userId) {
      return res.status(403).json({
        error: 'Access Forbidden',
        message: 'You can only analyze your own files'
      })
    }

    const filePath = path.join(process.cwd(), 'uploads', userId, filename)
    
    try {
      await fs.access(filePath)
    } catch {
      return res.status(404).json({
        error: 'File Not Found',
        message: 'The requested file was not found'
      })
    }

    // Get file stats
    const stats = await fs.stat(filePath)
    const ext = path.extname(filename).toLowerCase()
    const mimetype = getMimeType(ext)

    // Perform analysis
    const analysis = await analyzeFile(filePath, mimetype, filename)

    // Filter analysis based on type requested
    let result = analysis
    if (analysisType === 'content') {
      result = { content: analysis.content, summary: analysis.summary }
    } else if (analysisType === 'metadata') {
      result = { metadata: analysis.metadata, type: analysis.type }
    }

    res.json({
      success: true,
      message: 'File analyzed successfully',
      data: {
        filename,
        size: stats.size,
        mimetype,
        analysis: result
      }
    })
  } catch (error) {
    console.error('Analyze file error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred while analyzing the file'
    })
  }
})

export default router