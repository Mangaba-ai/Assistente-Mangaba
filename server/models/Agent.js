import mongoose from 'mongoose'

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Agent name is required'],
    trim: true,
    maxlength: [50, 'Agent name cannot exceed 50 characters']
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
  hubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hub',
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  personality: {
    type: {
      type: String,
      enum: ['assistant', 'creative', 'analytical', 'friendly', 'professional', 'expert', 'teacher', 'custom'],
      default: 'assistant'
    },
    traits: [{
      type: String,
      enum: [
        'helpful', 'creative', 'analytical', 'friendly', 'professional', 
        'patient', 'enthusiastic', 'precise', 'empathetic', 'innovative',
        'logical', 'supportive', 'detailed', 'concise', 'encouraging'
      ]
    }],
    tone: {
      type: String,
      enum: ['formal', 'casual', 'friendly', 'professional', 'enthusiastic', 'calm'],
      default: 'friendly'
    },
    expertise: [{
      type: String,
      trim: true,
      maxlength: [50, 'Expertise area cannot exceed 50 characters']
    }]
  },
  configuration: {
    model: {
      type: String,
      default: 'llama3.2',
      enum: ['llama3.2', 'llama3.1', 'mistral', 'codellama', 'gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3', 'custom']
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
      required: [true, 'System prompt is required'],
      maxlength: [2000, 'System prompt cannot exceed 2000 characters'],
      default: 'You are a helpful AI assistant.'
    },
    contextWindow: {
      type: Number,
      min: 1,
      max: 50,
      default: 10
    },
    responseFormat: {
      type: String,
      enum: ['text', 'markdown', 'json', 'code'],
      default: 'markdown'
    },
    capabilities: {
      fileAnalysis: {
        type: Boolean,
        default: true
      },
      imageAnalysis: {
        type: Boolean,
        default: true
      },
      codeGeneration: {
        type: Boolean,
        default: true
      },
      webSearch: {
        type: Boolean,
        default: false
      },
      dataAnalysis: {
        type: Boolean,
        default: false
      }
    }
  },
  prompts: {
    greeting: {
      type: String,
      maxlength: [500, 'Greeting cannot exceed 500 characters'],
      default: 'Olá! Como posso ajudar você hoje?'
    },
    examples: [{
      input: {
        type: String,
        required: true,
        maxlength: [200, 'Example input cannot exceed 200 characters']
      },
      output: {
        type: String,
        required: true,
        maxlength: [500, 'Example output cannot exceed 500 characters']
      }
    }],
    fallback: {
      type: String,
      maxlength: [300, 'Fallback message cannot exceed 300 characters'],
      default: 'Desculpe, não entendi sua pergunta. Pode reformular?'
    }
  },
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowFork: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      enum: ['general', 'coding', 'writing', 'analysis', 'education', 'business', 'creative', 'other'],
      default: 'general'
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    version: {
      type: String,
      default: '1.0.0'
    }
  },
  usage: {
    totalChats: {
      type: Number,
      default: 0
    },
    totalMessages: {
      type: Number,
      default: 0
    },
    totalTokens: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date,
      default: null
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived', 'deleted'],
    default: 'active'
  },
  parentAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    default: null
  },
  forkCount: {
    type: Number,
    default: 0
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
agentSchema.index({ userId: 1, status: 1, order: 1 })
agentSchema.index({ hubId: 1 })
agentSchema.index({ 'settings.category': 1 })
agentSchema.index({ 'settings.isPublic': 1 })
agentSchema.index({ 'usage.averageRating': -1 })
agentSchema.index({ 'usage.totalChats': -1 })
agentSchema.index({ createdAt: -1 })
agentSchema.index({ 'usage.lastUsed': -1 })

// Virtual for fork children
agentSchema.virtual('forks', {
  ref: 'Agent',
  localField: '_id',
  foreignField: 'parentAgent'
})

// Method to update usage statistics
agentSchema.methods.updateUsage = function(messageCount = 1, tokenCount = 0) {
  this.usage.totalMessages += messageCount
  this.usage.totalTokens += tokenCount
  this.usage.lastUsed = new Date()
  
  return this.save()
}

// Method to add rating
agentSchema.methods.addRating = function(rating) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }
  
  const currentTotal = this.usage.averageRating * this.usage.ratingCount
  this.usage.ratingCount += 1
  this.usage.averageRating = (currentTotal + rating) / this.usage.ratingCount
  
  return this.save()
}

// Method to create fork
agentSchema.methods.createFork = function(userId, modifications = {}) {
  const forkData = {
    ...this.toObject(),
    _id: undefined,
    userId: userId,
    parentAgent: this._id,
    name: `${this.name} (Fork)`,
    usage: {
      totalChats: 0,
      totalMessages: 0,
      totalTokens: 0,
      averageRating: 0,
      ratingCount: 0,
      lastUsed: null
    },
    forkCount: 0,
    createdAt: undefined,
    updatedAt: undefined,
    ...modifications
  }
  
  // Increment fork count on parent
  this.forkCount += 1
  this.save()
  
  return new this.constructor(forkData)
}

// Method to generate system prompt with personality
agentSchema.methods.getFullSystemPrompt = function() {
  let prompt = this.configuration.systemPrompt
  
  if (this.personality.traits.length > 0) {
    prompt += `\n\nPersonality traits: ${this.personality.traits.join(', ')}.`
  }
  
  if (this.personality.tone !== 'friendly') {
    prompt += `\n\nCommunication tone: ${this.personality.tone}.`
  }
  
  if (this.personality.expertise.length > 0) {
    prompt += `\n\nAreas of expertise: ${this.personality.expertise.join(', ')}.`
  }
  
  if (this.prompts.examples.length > 0) {
    prompt += '\n\nExample interactions:'
    this.prompts.examples.forEach((example, index) => {
      prompt += `\n${index + 1}. User: ${example.input}\nAssistant: ${example.output}`
    })
  }
  
  return prompt
}

// Static method to get popular agents
agentSchema.statics.getPopular = function(limit = 10) {
  return this.find({
    'settings.isPublic': true,
    status: 'active'
  })
  .sort({ 'usage.averageRating': -1, 'usage.totalChats': -1 })
  .limit(limit)
  .populate('userId', 'name avatar')
}

// Static method to get user's agents
agentSchema.statics.getUserAgents = function(userId, hubId = null) {
  const query = {
    userId: userId,
    status: { $ne: 'deleted' }
  }
  
  if (hubId) {
    query.hubId = hubId
  }
  
  return this.find(query)
    .sort({ order: 1, createdAt: -1 })
    .populate('hubId', 'name color')
}

const Agent = mongoose.model('Agent', agentSchema)

export default Agent