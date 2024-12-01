import { Router } from 'express';
import { reactionController } from './reaction.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { asyncHandler } from '../../core/middleware/async.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateReactionDto:
 *       type: object
 *       required:
 *         - entity_type
 *         - entity_id
 *         - reaction
 *       properties:
 *         entity_type:
 *           type: string
 *           enum: [Post, Comment]
 *           description: Type of entity being reacted to
 *         entity_id:
 *           type: integer
 *           description: ID of the entity being reacted to
 *         reaction:
 *           type: string
 *           enum: [Like, Dislike, Love]
 *           description: Type of reaction
 */

/**
 * @swagger
 * /api/reactions:
 *   post:
 *     tags: [Reactions]
 *     summary: Toggle a reaction on a post or comment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReactionDto'
 *     responses:
 *       200:
 *         description: Reaction toggled successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - User not logged in
 */
router.post('/', authMiddleware, asyncHandler(reactionController.toggleReaction));

/**
 * @swagger
 * /api/reactions/{entityType}/{entityId}:
 *   get:
 *     tags: [Reactions]
 *     summary: Get reactions for a post or comment
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Post, Comment]
 *         description: Type of entity to get reactions for
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the entity to get reactions for
 *     responses:
 *       200:
 *         description: Reaction counts and user's reaction
 *       400:
 *         description: Invalid entity type
 */
router.get('/:entityType/:entityId', asyncHandler(reactionController.getReactions));

/**
 * @swagger
 * /api/reactions/{entityType}/{entityId}/like:
 *   post:
 *     tags: [Reactions]
 *     summary: Toggle like for an entity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Post, Comment]
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/:entityType/:entityId/like', authMiddleware, asyncHandler(reactionController.toggleLike));

/**
 * @swagger
 * /api/reactions/{entityType}/{entityId}/likes:
 *   get:
 *     tags: [Reactions]
 *     summary: Get likes count for an entity
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Post, Comment]
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Likes count and user's like status
 */
router.get('/:entityType/:entityId/likes', asyncHandler(reactionController.getLikes));

export { router as reactionRouter };
