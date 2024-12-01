import { EntityType } from '@prisma/client';
import { prisma } from '../../prisma';

export class AuditService {
  private static instance: AuditService;

  private constructor() {}

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  async log(userId: number, action: string, entityType?: EntityType, entityId?: number): Promise<void> {
    await prisma.auditLog.create({
      data: {
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
      },
    });
  }

  async getUserAuditLogs(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [total, logs] = await Promise.all([
      prisma.auditLog.count({
        where: { user_id: userId },
      }),
      prisma.auditLog.findMany({
        where: { user_id: userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEntityAuditLogs(entityType: EntityType, entityId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [total, logs] = await Promise.all([
      prisma.auditLog.count({
        where: {
          entity_type: entityType,
          entity_id: entityId,
        },
      }),
      prisma.auditLog.findMany({
        where: {
          entity_type: entityType,
          entity_id: entityId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const auditService = AuditService.getInstance();
