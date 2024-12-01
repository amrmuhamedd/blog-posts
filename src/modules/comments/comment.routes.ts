import { Router } from 'express';
import { commentController } from './comment.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { asyncHandler } from '../../core/middleware/async.middleware';

const router = Router();

/**
 * @swagger
 * /api/comments/{postId}:
 *   get:
 *     tags: [Comments]
 *     summary: Get all comments for a post
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:postId', asyncHandler(commentController.getCommentsByPostId));

/**
 * @swagger
 * /api/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Create a new comment
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware, asyncHandler(commentController.createComment));

/**
 * @swagger
 * /api/comments/{commentId}:
 *   delete:
 *     tags: [Comments]
 *     summary: Delete a comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete('/:commentId', authMiddleware, asyncHandler(commentController.deleteComment));

/**
 * @swagger
 * /api/comments/{commentId}:
 *   put:
 *     tags: [Comments]
 *     summary: Update a comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 */
router.put('/:commentId', authMiddleware, asyncHandler(commentController.updateComment));

export { router as commentRouter };
