import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [10000, 'Message cannot exceed 10000 characters']
  },
  role: {
    type: String,
    required: [true, 'Message role is required'],
    enum: ['user', 'assistant', 'system']
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'document', 'audio', 'video'],
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    analysis: {
      type: String,
      default: null
    }
  }],
  metadata: {
    tokens: {
      type: Number,
      default: 0
    },
    processingTime: {
      type: Number,
      default: 0
    },
    model: {
      type: String,
      default: null
    },
    temperature: {
      type: Number,
      default: 0.7
    }
  },
  reactions: [{
    type: {
      type: String,
      enum: ['like', 'dislike', 'love', 'helpful', 'unhelpful']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
})

const chatSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Chat title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  hubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hub',
    default: null
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    default: null
  },
  messages: [messageSchema],
  settings: {
    model: {
      type: String,
      default: 'gpt-3.5-turbo'
    },
    temperature: {
      type: Number,
      min: 0,
      max: 2,
      default: 0.7
    },
    maxTokens: {
      type: Number,
      min: 1,
      max: 4000,
      default: 1000
    },
    systemPrompt: {
      type: String,
      default: 'You are a helpful AI assistant.'
    }
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  isShared: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    default: null
  },
  shareSettings: {
    allowComments: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  statistics: {
    messageCount: {
      type: Number,
      default: 0
    },
    totalTokens: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
chatSchema.index({ userId: 1, createdAt: -1 })
chatSchema.index({ hubId: 1 })
chatSchema.index({ agentId: 1 })
chatSchema.index({ status: 1 })
chatSchema.index({ lastMessageAt: -1 })
chatSchema.index({ shareToken: 1 })
chatSchema.index({ 'messages.createdAt': -1 })

// Virtual for message count
chatSchema.virtual('messageCount').get(function() {
  return this.messages.length
})

// Virtual for last message
chatSchema.virtual('lastMessage').get(function() {
  return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null
})

// Update statistics before saving
chatSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.statistics.messageCount = this.messages.length
    this.statistics.totalTokens = this.messages.reduce((total, msg) => {
      return total + (msg.metadata?.tokens || 0)
    }, 0)
    
    if (this.messages.length > 0) {
      this.lastMessageAt = this.messages[this.messages.length - 1].createdAt
      this.statistics.lastActivity = new Date()
    }
  }
  next()
})

// Method to add message
chatSchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData)
  return this.save()
}

// Method to update message
chatSchema.methods.updateMessage = function(messageId, updates) {
  const message = this.messages.id(messageId)
  if (!message) {
    throw new Error('Message not found')
  }
  
  // Save edit history if content is being updated
  if (updates.content && updates.content !== message.content) {
    message.editHistory.push({
      content: message.content,
      editedAt: new Date()
    })
    message.isEdited = true
  }
  
  Object.assign(message, updates)
  return this.save()
}

// Method to delete message
chatSchema.methods.deleteMessage = function(messageId) {
  this.messages.id(messageId).remove()
  return this.save()
}

// Method to generate share token
chatSchema.methods.generateShareToken = function() {
  this.shareToken = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15)
  this.isShared = true
  return this.save()
}

const Chat = mongoose.model('Chat', chatSchema)

export default Chat