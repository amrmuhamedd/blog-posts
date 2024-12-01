export interface JwtPayload {
  id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
