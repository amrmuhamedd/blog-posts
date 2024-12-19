# Blog Posts API

A modern, feature-rich blogging platform API built with Node.js, Express, TypeScript, and PostgreSQL. This project follows clean architecture principles and provides a robust foundation for building scalable blog applications.
![screencapture-localhost-3003-api-docs-2024-12-19-02_04_16](https://github.com/user-attachments/assets/ab3b1d7e-e3af-484a-8c15-aff92c3be5e3)

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin/User)
  - Secure password hashing with bcrypt

- **Blog Posts Management**
  - CRUD operations for posts
  - Draft/Published/Scheduled post status
  - Categories and tags support
  - Rich text content support

- **Comments System**
  - Nested comments support
  - Comment moderation
  - CRUD operations for comments

- **Reactions System**
  - Like/Unlike posts and comments
  - Reaction counts and user reaction status
  - Extensible reaction types

- **Media Management**
  - Image upload support with Cloudinary
  - Profile picture management
  - Media optimization

- **User Management**
  - User profiles with avatars
  - Bio and personal information
  - Activity tracking

- **Audit Logging System**
  - Comprehensive activity tracking
  - User action logging across all modules
  - Detailed audit trail for compliance
  - Action types: CREATE, READ, UPDATE, DELETE
  - Entity-specific audit records

## Architecture

The project follows a modular architecture with clear separation of concerns:

```
src/
├── core/                 # Core functionality and shared code
│   ├── middleware/      # Express middleware
│   │   └── audit/      # Audit logging middleware
│   ├── interfaces/      # TypeScript interfaces
│   ├── services/       # Core services
│   │   └── audit/     # Audit logging service
│   └── utils/          # Utility functions
│
├── modules/             # Feature modules
│   ├── audit/          # Audit system module
│   ├── users/          # User management
│   ├── posts/          # Blog posts
│   ├── comments/       # Comments system
│   ├── reactions/      # Reactions/Likes
│   ├── categories/     # Post categories
│   └── tags/           # Post tags
│
└── app.ts              # Application entry point
```

Each module follows a consistent structure:
- `controller.ts`: Request handling and response formatting
- `service.ts`: Business logic implementation
- `routes.ts`: Route definitions and middleware
- `dto/`: Data Transfer Objects for validation

## Technology Stack

- **Runtime**: Node.js (>18.16.0)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Jest
- **Authentication**: JWT with bcrypt
- **Validation**: class-validator, express-validator
- **Documentation**: Swagger/OpenAPI
- **Cloud Storage**: Cloudinary
- **Development**: ESLint, TypeScript
- **API Security**: CORS enabled

## Project Setup

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd blog-posts
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   yarn migrate
   ```

5. **Development Server**
   ```bash
   yarn dev
   ```

6. **Production Build**
   ```bash
   yarn build
   yarn start
   ```

## Available Scripts

- `yarn dev`: Start development server with hot-reload
- `yarn migrate`: Run Prisma migrations for development
- `yarn migrate:prod`: Run Prisma migrations for production
- `yarn build`: Build the TypeScript project
- `yarn start`: Start the production server
- `yarn lint`: Run ESLint
- `yarn test`: Run Jest tests
- `yarn test:watch`: Run tests in watch mode

## Docker Support

The project includes Docker support for easy deployment:

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## API Documentation

API documentation is available at `/api-docs` when running the server. The API follows RESTful principles and includes:

- Detailed endpoint descriptions
- Request/Response examples
- Authentication requirements
- Schema definitions

## Environment Variables

Required environment variables (see `.env.example`):
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing
- `CLOUDINARY_*`: Cloudinary configuration
- `PORT`: Server port (default: 3000)

## Testing

```bash
# Run tests
yarn test

# Run tests with coverage
yarn test:coverage
```

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register new user
- `POST /api/auth/login`: Login user

### Posts
- `GET /api/posts`: List posts
- `POST /api/posts`: Create post
- `GET /api/posts/:id`: Get post
- `PUT /api/posts/:id`: Update post
- `DELETE /api/posts/:id`: Delete post

### Comments
- `GET /api/comments/:postId`: List comments
- `POST /api/comments`: Create comment
- `PUT /api/comments/:id`: Update comment
- `DELETE /api/comments/:id`: Delete comment

### Reactions
- `POST /api/reactions/:entityType/:entityId/like`: Toggle like
- `GET /api/reactions/:entityType/:entityId/likes`: Get likes count

### Audit Logs
- `GET /api/audit/logs`: List audit logs (Admin only)
- `GET /api/audit/logs/:entityType`: Get logs by entity type
- `GET /api/audit/logs/:entityType/:entityId`: Get entity-specific logs
- `GET /api/audit/users/:userId/activity`: Get user activity logs

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
