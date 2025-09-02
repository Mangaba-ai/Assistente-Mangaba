import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      default: 'pt-BR'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    expiresAt: {
      type: Date,
      default: null
    },
    features: {
      maxChats: {
        type: Number,
        default: 10
      },
      maxHubs: {
        type: Number,
        default: 3
      },
      maxAgents: {
        type: Number,
        default: 5
      },
      fileUpload: {
        type: Boolean,
        default: true
      },
      apiAccess: {
        type: Boolean,
        default: false
      }
    }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password
      delete ret.emailVerificationToken
      delete ret.passwordResetToken
      delete ret.passwordResetExpires
      return ret
    }
  }
})

// Index for better query performance
userSchema.index({ email: 1 })
userSchema.index({ createdAt: -1 })

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw new Error('Password comparison failed')
  }
}

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date()
  return this.save({ validateBeforeSave: false })
}

// Check if user can create more resources
userSchema.methods.canCreateChat = function(currentCount) {
  return currentCount < this.subscription.features.maxChats
}

userSchema.methods.canCreateHub = function(currentCount) {
  return currentCount < this.subscription.features.maxHubs
}

userSchema.methods.canCreateAgent = function(currentCount) {
  return currentCount < this.subscription.features.maxAgents
}

const User = mongoose.model('User', userSchema)

export default User