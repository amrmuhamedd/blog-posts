import express from 'express';
import 'reflect-metadata';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { config } from './core/config/config.service';
import { errorMiddleware } from './core/middleware/error.middleware';
import { swaggerConfig } from './core/config/swagger.config';

// Routes
import userRoutes from './modules/users/user.routes';
import postRoutes from './modules/posts/post.routes';
import { tagRoutes } from './modules/tags/tag.routes';
import { categoryRoutes } from './modules/categories/category.routes';
import  {commentRouter}  from './modules/comments/comment.routes';
import { reactionRouter } from './modules/reactions/reaction.routes';
import auditRoutes from './modules/audit/audit.routes';

class App {
  public app: express.Application;
  private readonly apiPrefix: string;

  constructor() {
    this.app = express();
    this.apiPrefix = config.get('API_PREFIX') || '/api';
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // API Documentation
    this.app.use(
      '/api-docs',
      swaggerUi.serve as any,
      swaggerUi.setup(swaggerConfig) as any
    );
  }

  private initializeRoutes(): void {
    this.app.use(`${this.apiPrefix}/users`, userRoutes);
    this.app.use(`${this.apiPrefix}/posts`, postRoutes);
    this.app.use(`${this.apiPrefix}/tags`, tagRoutes);
    this.app.use(`${this.apiPrefix}/categories`, categoryRoutes);
    this.app.use(`${this.apiPrefix}/comments`, commentRouter);
    this.app.use(`${this.apiPrefix}/reactions`, reactionRouter);
    this.app.use(`${this.apiPrefix}/audit`, auditRoutes);

    // Health check endpoint
    this.app.get('/health', (_, res) => {
      res.status(200).json({ status: 'ok' });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  public listen(): void {
    const port = config.get('PORT') || 3000;
    const env = config.get('NODE_ENV') || 'development';

    this.app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port} in ${env} mode`);
      console.log(`📚 API Documentation available at http://localhost:${port}/api-docs`);
    });
  }
}

const app = new App();
app.listen();
