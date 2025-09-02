import mongoose from 'mongoose'

const hubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hub name is required'],
    trim: true,
    maxlength: [50, 'Hub name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  icon: {
    type: String,
    default: 'folder'
  },
  color: {
    type: String,
    default: '#3b82f6',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color']
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'education', 'research', 'creative', 'other'],
    default: 'other'
  },
  settings: {
    isPrivate: {
      type: Boolean,
      default: false
    },
    allowCollaboration: {
      type: Boolean,
      default: false
    },
    defaultModel: {
      type: String,
      default: 'llama3.2'
    },
    defaultTemperature: {
      type: Number,
      min: 0,
      max: 2,
      default: 0.7
    },
    autoArchive: {
      enabled: {
        type: Boolean,
        default: false
      },
      daysInactive: {
        type: Number,
        default: 30
      }
    }
  },
  collaborators: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      default: 'viewer'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  statistics: {
    chatCount: {
      type: Number,
      default: 0
    },
    agentCount: {
      type: Number,
      default: 0
    },
    messageCount: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
hubSchema.index({ userId: 1, status: 1, order: 1 })
hubSchema.index({ category: 1 })
hubSchema.index({ 'collaborators.userId': 1 })
hubSchema.index({ createdAt: -1 })
hubSchema.index({ 'statistics.lastActivity': -1 })

// Virtual for total collaborators
hubSchema.virtual('collaboratorCount').get(function() {
  return this.collaborators.length
})

// Method to add collaborator
hubSchema.methods.addCollaborator = function(userId, role, addedBy) {
  // Check if user is already a collaborator
  const existingCollaborator = this.collaborators.find(
    collab => collab.userId.toString() === userId.toString()
  )
  
  if (existingCollaborator) {
    throw new Error('User is already a collaborator')
  }
  
  this.collaborators.push({
    userId,
    role,
    addedBy
  })
  
  return this.save()
}

// Method to remove collaborator
hubSchema.methods.removeCollaborator = function(userId) {
  this.collaborators = this.collaborators.filter(
    collab => collab.userId.toString() !== userId.toString()
  )
  
  return this.save()
}

// Method to update collaborator role
hubSchema.methods.updateCollaboratorRole = function(userId, newRole) {
  const collaborator = this.collaborators.find(
    collab => collab.userId.toString() === userId.toString()
  )
  
  if (!collaborator) {
    throw new Error('Collaborator not found')
  }
  
  collaborator.role = newRole
  return this.save()
}

// Method to check if user has access
hubSchema.methods.hasAccess = function(userId, requiredRole = 'viewer') {
  // Owner always has access
  if (this.userId.toString() === userId.toString()) {
    return true
  }
  
  // Check collaborators
  const collaborator = this.collaborators.find(
    collab => collab.userId.toString() === userId.toString()
  )
  
  if (!collaborator) {
    return false
  }
  
  // Role hierarchy: viewer < editor < admin
  const roleHierarchy = { viewer: 1, editor: 2, admin: 3 }
  return roleHierarchy[collaborator.role] >= roleHierarchy[requiredRole]
}

// Update statistics before saving
hubSchema.pre('save', function(next) {
  if (this.isModified('collaborators') || this.isNew) {
    this.statistics.lastActivity = new Date()
  }
  next()
})

// Static method to get user's hubs
hubSchema.statics.getUserHubs = function(userId) {
  return this.find({
    $or: [
      { userId: userId },
      { 'collaborators.userId': userId }
    ],
    status: 'active'
  }).sort({ order: 1, createdAt: -1 })
}

const Hub = mongoose.model('Hub', hubSchema)

export default Hub