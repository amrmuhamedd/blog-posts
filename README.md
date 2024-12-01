# Blog Posts API

A modern, feature-rich blogging platform API built with Node.js, Express, TypeScript, and PostgreSQL. This project follows clean architecture principles and provides a robust foundation for building scalable blog applications.

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

## Architecture

The project follows a modular architecture with clear separation of concerns:

```
src/
├── core/                 # Core functionality and shared code
│   ├── middleware/      # Express middleware
│   ├── interfaces/      # TypeScript interfaces
│   └── utils/          # Utility functions
│
├── modules/             # Feature modules
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
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Validation**: class-validator, express-validator
- **File Upload**: Multer, Cloudinary
- **Documentation**: Swagger/OpenAPI
- **Development**: ESLint, Nodemon

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/blog-posts.git
   cd blog-posts
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   yarn migrate
   ```

5. **Start Development Server**
   ```bash
   yarn dev
   ```

6. **Build for Production**
   ```bash
   yarn build
   yarn start
   ```

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
