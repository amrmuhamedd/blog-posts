import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config.service';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blog API',
      version: '1.0.0',
      description: 'A simple blog API with posts, users, and tags',
    },
    servers: [
      {
        url: `http://localhost:${config.get('PORT')}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/modules/**/*.routes.ts',
    './src/modules/**/*.dto.ts'
  ], // Path to the API routes and DTOs
};

export const swaggerConfig = swaggerJsdoc(options);
