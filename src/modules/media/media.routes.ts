import { Router } from 'express';
import { MediaController } from './media.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { asyncHandler } from '../../core/middleware/async.middleware';
import { createAuditMiddleware } from '../../core/middleware/audit.middleware';
import { EntityType } from '@prisma/client';

const router = Router();
const mediaController = new MediaController();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateMediaDto:
 *       type: object
 *       required:
 *         - postId
 *         - fileUrl
 *         - type
 *       properties:
 *         postId:
 *           type: integer
 *           description: The ID of the post this media belongs to
 *         fileUrl:
 *           type: string
 *           description: The URL of the media file
 *         type:
 *           type: string
 *           enum: [IMAGE, VIDEO, AUDIO, DOCUMENT]
 *           description: The type of media
 *     UpdateMediaDto:
 *       type: object
 *       properties:
 *         fileUrl:
 *           type: string
 *           description: The updated URL of the media file
 *         type:
 *           type: string
 *           enum: [IMAGE, VIDEO, AUDIO, DOCUMENT]
 *           description: The updated type of media
 *     BulkCreateMediaDto:
 *       type: object
 *       required:
 *         - postId
 *         - media
 *       properties:
 *         postId:
 *           type: integer
 *           description: The ID of the post these media belong to
 *         media:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - fileUrl
 *               - type
 *             properties:
 *               fileUrl:
 *                 type: string
 *                 description: The URL of the media file
 *               type:
 *                 type: string
 *                 enum: [IMAGE, VIDEO, AUDIO, DOCUMENT]
 *                 description: The type of media
 */

/**
 * @swagger
 * /api/media:
 *   post:
 *     tags: [Media]
 *     summary: Create a new media
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMediaDto'
 *     responses:
 *       201:
 *         description: Media created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - User not logged in
 *       404:
 *         description: Post not found
 */
router.post('/', 
  authMiddleware, 
  createAuditMiddleware({
    action: 'CREATE_MEDIA',
    entityType: EntityType.Media,
    getEntityId: (req) => undefined, // ID not available before creation
  }),
  asyncHandler(mediaController.create.bind(mediaController))
);

/**
 * @swagger
 * /api/media/bulk:
 *   post:
 *     tags: [Media]
 *     summary: Create multiple media items
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkCreateMediaDto'
 *     responses:
 *       201:
 *         description: Media items created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - User not logged in
 *       404:
 *         description: Post not found
 */
router.post('/bulk', 
  authMiddleware, 
  createAuditMiddleware({
    action: 'BULK_CREATE_MEDIA',
    entityType: EntityType.Media,
  }),
  asyncHandler(mediaController.bulkCreate.bind(mediaController))
);

/**
 * @swagger
 * /api/media:
 *   get:
 *     tags: [Media]
 *     summary: Get media list with filtering and pagination
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema:
 *           type: integer
 *         description: Filter by post ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [IMAGE, VIDEO, AUDIO, DOCUMENT]
 *         description: Filter by media type
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
 *         description: List of media items
 */
router.get('/', asyncHandler(mediaController.list.bind(mediaController)));

/**
 * @swagger
 * /api/media/post/{postId}:
 *   get:
 *     tags: [Media]
 *     summary: Get all media for a specific post
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the post to get media for
 *     responses:
 *       200:
 *         description: List of media items for the post
 *       404:
 *         description: Post not found
 */
router.get('/post/:postId', asyncHandler(mediaController.getByPostId.bind(mediaController)));

/**
 * @swagger
 * /api/media/{id}:
 *   get:
 *     tags: [Media]
 *     summary: Get media by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the media to retrieve
 *     responses:
 *       200:
 *         description: Media item found
 *       404:
 *         description: Media not found
 */
router.get('/:id', asyncHandler(mediaController.getById.bind(mediaController)));

/**
 * @swagger
 * /api/media/{id}:
 *   patch:
 *     tags: [Media]
 *     summary: Update media
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the media to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMediaDto'
 *     responses:
 *       200:
 *         description: Media updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - User not logged in
 *       404:
 *         description: Media not found
 */
router.patch('/:id', 
  authMiddleware, 
  createAuditMiddleware({
    action: 'UPDATE_MEDIA',
    entityType: EntityType.Media,
    getEntityId: (req) => parseInt(req.params.id),
  }),
  asyncHandler(mediaController.update.bind(mediaController))
);

/**
 * @swagger
 * /api/media/{id}:
 *   delete:
 *     tags: [Media]
 *     summary: Delete media
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the media to delete
 *     responses:
 *       204:
 *         description: Media deleted successfully
 *       401:
 *         description: Unauthorized - User not logged in
 *       404:
 *         description: Media not found
 */
router.delete('/:id', 
  authMiddleware, 
  createAuditMiddleware({
    action: 'DELETE_MEDIA',
    entityType: EntityType.Media,
    getEntityId: (req) => parseInt(req.params.id),
  }),
  asyncHandler(mediaController.delete.bind(mediaController))
);

export default router;
