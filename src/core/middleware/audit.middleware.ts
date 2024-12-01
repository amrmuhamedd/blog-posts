import { Request, Response, NextFunction } from 'express';
import { EntityType } from '@prisma/client';
import { auditService } from '../services/audit.service';

export interface AuditOptions {
  action: string;
  entityType?: EntityType;
  getEntityId?: (req: Request) => number | undefined;
}

export const createAuditMiddleware = (options: AuditOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next();
      }

      const entityId = options.getEntityId ? options.getEntityId(req) : undefined;

      // Log the action
      await auditService.log(
        userId,
        options.action,
        options.entityType,
        entityId,
      );

      next();
    } catch (error) {
      // If audit logging fails, we still want the main request to proceed
      console.error('Audit logging failed:', error);
      next();
    }
  };
};
