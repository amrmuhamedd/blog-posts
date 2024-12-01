import { Router } from 'express';
import { auditController } from './audit.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { asyncHandler } from '../../core/middleware/async.middleware';

const router = Router();

/**
 * @swagger
 * /api/audit/users/{userId}:
 *   get:
 *     tags: [Audit]
 *     summary: Get audit logs for a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to get audit logs for
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of audit logs for the user
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/users/:userId', authMiddleware, asyncHandler(auditController.getUserLogs));

/**
 * @swagger
 * /api/audit/{entityType}/{entityId}:
 *   get:
 *     tags: [Audit]
 *     summary: Get audit logs for a specific entity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Post, Comment, User, Media, Category, Tag, Reaction]
 *         description: Type of the entity
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the entity
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of audit logs for the entity
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Entity not found
 */
router.get('/:entityType/:entityId', authMiddleware, asyncHandler(auditController.getEntityLogs));

export default router;
