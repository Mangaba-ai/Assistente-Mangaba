# Mangaba Assistant - Backend Server

Modern Node.js/Express backend for the Mangaba AI Assistant application.

## Features

- **Authentication & Authorization**: JWT-based auth with refresh tokens
- **User Management**: Registration, login, profile management
- **Chat System**: Real-time messaging with AI agents
- **Hub Management**: Collaborative workspaces with role-based access
- **Agent System**: Create, fork, and share AI agents
- **File Upload & Analysis**: Support for images, documents, and text files
- **Security**: Rate limiting, input validation, CORS protection
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: Local file system with organized structure

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Validation**: express-validator
- **Security**: Helmet, CORS, bcryptjs
- **Environment**: dotenv

## Project Structure

```
server/
├── index.js              # Main server file
├── package.json          # Dependencies and scripts
├── .env.example         # Environment variables template
├── README.md            # This file
├── models/              # Database models
│   ├── User.js          # User model
│   ├── Chat.js          # Chat conversation model
│   ├── Hub.js           # Hub workspace model
│   └── Agent.js         # AI agent model
├── routes/              # API routes
│   ├── auth.js          # Authentication routes
│   ├── chat.js          # Chat management routes
│   ├── hubs.js          # Hub management routes
│   ├── agents.js        # Agent management routes
│   └── uploads.js       # File upload routes
├── middleware/          # Custom middleware
│   └── auth.js          # Authentication middleware
├── uploads/             # File storage directory
└── logs/               # Application logs
```

## Installation

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration values.

4. **Start MongoDB**:
   Make sure MongoDB is running on your system or use MongoDB Atlas.

5. **Run the server**:
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

### Required Variables

- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens
- `FRONTEND_URL`: Frontend application URL for CORS

### Optional Variables

- `NODE_ENV`: Environment (development/production)
- `RATE_LIMIT_*`: Rate limiting configuration
- `SMTP_*`: Email configuration
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `GOOGLE_CLOUD_*`: Google Cloud credentials for image analysis
- `AWS_*`: AWS credentials for file processing
- `STRIPE_*`: Stripe configuration for payments

## API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - User registration
- `POST /login` - User login
- `POST /refresh` - Refresh JWT token
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password

### Chat Management (`/api/chat`)

- `GET /` - Get user's chats
- `POST /` - Create new chat
- `GET /:id` - Get specific chat
- `PUT /:id` - Update chat
- `DELETE /:id` - Delete chat
- `POST /:id/messages` - Add message to chat
- `PUT /:id/messages/:messageId` - Update message
- `DELETE /:id/messages/:messageId` - Delete message
- `POST /:id/share` - Generate share token
- `GET /shared/:token` - Get shared chat

### Hub Management (`/api/hubs`)

- `GET /` - Get user's hubs
- `POST /` - Create new hub
- `GET /:id` - Get specific hub
- `PUT /:id` - Update hub
- `DELETE /:id` - Delete hub
- `POST /:id/collaborators` - Add collaborator
- `PUT /:id/collaborators/:userId` - Update collaborator role
- `DELETE /:id/collaborators/:userId` - Remove collaborator
- `PUT /reorder` - Reorder hubs

### Agent Management (`/api/agents`)

- `GET /` - Get agents (own + public)
- `POST /` - Create new agent
- `GET /popular` - Get popular agents
- `GET /:id` - Get specific agent
- `PUT /:id` - Update agent
- `DELETE /:id` - Delete agent
- `POST /:id/fork` - Fork agent
- `POST /:id/rate` - Rate agent
- `GET /:id/forks` - Get agent forks

### File Upload (`/api/uploads`)

- `POST /` - Upload files
- `GET /files/:userId/:filename` - Serve file
- `DELETE /files/:userId/:filename` - Delete file
- `GET /user/:userId` - Get user's files
- `POST /analyze` - Analyze file content

## Database Models

### User Model
- Personal information and preferences
- Authentication credentials
- Subscription and usage limits
- Security settings

### Chat Model
- Conversation metadata
- Message history with attachments
- Sharing and collaboration settings
- Usage statistics

### Hub Model
- Workspace organization
- Collaborator management
- Settings and permissions
- Activity tracking

### Agent Model
- AI agent configuration
- Personality and behavior settings
- Usage analytics and ratings
- Fork relationships

## Security Features

- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Role-based access control
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive request validation
- **File Security**: Type and size restrictions
- **CORS Protection**: Configurable origin restrictions
- **Password Security**: bcrypt hashing
- **SQL Injection Prevention**: Mongoose ODM protection

## File Upload System

- **Supported Types**: Images, documents, text files, code files
- **Size Limits**: 10MB per file, 5 files per request
- **Storage**: Organized by user ID
- **Analysis**: Automatic content analysis and metadata extraction
- **Security**: User-isolated file access

## Development

### Scripts

```bash
# Start development server with auto-restart
npm run dev

# Start production server
npm start

# Run tests (when implemented)
npm test

# Lint code (when configured)
npm run lint
```

### Adding New Features

1. **Models**: Add new Mongoose schemas in `/models`
2. **Routes**: Create route handlers in `/routes`
3. **Middleware**: Add custom middleware in `/middleware`
4. **Validation**: Use express-validator for input validation
5. **Testing**: Add tests for new functionality

### Database Seeding

For development, you can create seed data:

```javascript
// Example seed script
const User = require('./models/User')
const Hub = require('./models/Hub')
const Agent = require('./models/Agent')

// Create sample data...
```

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB instance
- [ ] Set strong JWT secrets
- [ ] Configure CORS for production domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

### Environment Setup

```bash
# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start index.js --name "mangaba-backend"

# Monitor
pm2 monit

# Logs
pm2 logs mangaba-backend
```

## Monitoring & Logging

- **Application Logs**: Morgan HTTP request logging
- **Error Handling**: Centralized error handling middleware
- **Health Checks**: Basic server health endpoints
- **Performance**: Monitor response times and memory usage

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include input validation
4. Write tests for new features
5. Update documentation
6. Follow security best practices

## License

This project is part of the Mangaba Assistant application.