import { Router } from 'express';
import { postController } from './post.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { asyncHandler } from '../../core/middleware/async.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: Operations related to blog posts
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: List all posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Draft, Published, Scheduled]
 *       - in: query
 *         name: tag
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get('/', asyncHandler(postController.listPosts.bind(postController)));

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostDto'
 *     responses:
 *       201:
 *         description: Post created successfully
 */
router.post(
  '/',
  authMiddleware,
  asyncHandler(postController.createPost.bind(postController))
);

/**
 * @swagger
 * /api/posts/{postId}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePostDto'
 *     responses:
 *       200:
 *         description: Post updated successfully
 */
router.put(
  '/:postId',
  authMiddleware,
  asyncHandler(postController.updatePost.bind(postController))
);

/**
 * @swagger
 * /api/posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Post deleted successfully
 */
router.delete(
  '/:postId',
  authMiddleware,
  asyncHandler(postController.deletePost.bind(postController))
);

export default router;
