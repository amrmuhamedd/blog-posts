import { Router } from 'express';
import { commentController } from './comment.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { asyncHandler } from '../../core/middleware/async.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCommentDto:
 *       type: object
 *       required:
 *         - content
 *         - post_id
 *       properties:
 *         content:
 *           type: string
 *           minLength: 1
 *           description: The content of the comment
 *         post_id:
 *           type: integer
 *           description: The ID of the post this comment belongs to
 *         parent_id:
 *           type: integer
 *           description: Optional ID of the parent comment (for nested comments)
 *     UpdateCommentDto:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           minLength: 1
 *           description: The updated content of the comment
 */

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
 *         description: ID of the post to get comments for
 *     responses:
 *       200:
 *         description: List of comments for the post
 *       404:
 *         description: Post not found
 */
router.get('/:postId', asyncHandler(commentController.listComments));

/**
 * @swagger
 * /api/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Create a new comment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommentDto'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - User not logged in
 *       404:
 *         description: Post not found
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
 *         description: ID of the comment to delete
 *     responses:
 *       204:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized - User not logged in
 *       403:
 *         description: Forbidden - User doesn't own the comment
 *       404:
 *         description: Comment not found
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
 *         description: ID of the comment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCommentDto'
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - User not logged in
 *       403:
 *         description: Forbidden - User doesn't own the comment
 *       404:
 *         description: Comment not found
 */
router.put('/:commentId', authMiddleware, asyncHandler(commentController.updateComment));

export { router as commentRouter };
