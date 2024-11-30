import { Response, NextFunction } from 'express';
import { Request } from '../types/express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Check if user exists and has admin role
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};
