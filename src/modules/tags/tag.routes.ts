import { Router } from 'express';
import { tagController } from './tag.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { adminMiddleware } from '../../core/middleware/admin.middleware';
import { asyncHandler } from '../../core/middleware/async.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Tags
 *     description: Operations related to blog tags
 */

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: List all tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: List of tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CreateTagDto'
 *       500:
 *         description: Server error
 */
router.get('/', asyncHandler(tagController.listTags.bind(tagController)));

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Create a new tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTagDto'
 *     responses:
 *       201:
 *         description: Tag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateTagDto'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  asyncHandler(tagController.createTag.bind(tagController))
);

/**
 * @swagger
 * /api/tags/{id}:
 *   put:
 *     summary: Update a tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tag ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTagDto'
 *     responses:
 *       200:
 *         description: Tag updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateTagDto'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Tag not found
 */
router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  asyncHandler(tagController.updateTag.bind(tagController))
);

/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     summary: Delete a tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tag ID
 *     responses:
 *       204:
 *         description: Tag deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Tag not found
 */
router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  asyncHandler(tagController.deleteTag.bind(tagController))
);

export { router as tagRoutes };
