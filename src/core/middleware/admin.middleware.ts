import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/forbidden.error';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new ForbiddenError('Admin access required');
  }
  next();
};
