export interface JwtPayload {
  id: number;
  name: string;
  email: string;
  role: Roles;
}

import { Request } from 'express';
import { Roles } from '../enums/roles';

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
