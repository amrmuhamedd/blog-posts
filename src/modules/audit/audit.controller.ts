import { Request, Response } from 'express';
import { auditService } from '../../core/services/audit.service';
import { EntityType } from '@prisma/client';

export class AuditController {
  private static instance: AuditController;

  private constructor() {}

  public static getInstance(): AuditController {
    if (!AuditController.instance) {
      AuditController.instance = new AuditController();
    }
    return AuditController.instance;
  }

  async getUserLogs(req: Request, res: Response) {
    const userId = parseInt(req.params.userId);
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const logs = await auditService.getUserAuditLogs(userId, page, limit);
    res.json(logs);
  }

  async getEntityLogs(req: Request, res: Response) {
    const entityType = req.params.entityType as EntityType;
    const entityId = parseInt(req.params.entityId);
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const logs = await auditService.getEntityAuditLogs(entityType, entityId, page, limit);
    res.json(logs);
  }
}

export const auditController = AuditController.getInstance();
