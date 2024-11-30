import { Request as ExpressRequest } from 'express';

// Extend the default Express Request type with your custom properties
export interface Request extends ExpressRequest {
  user?: {
    id: number;
    name: string;
    email: string;
    role?: string; // Make role optional
  };
}
