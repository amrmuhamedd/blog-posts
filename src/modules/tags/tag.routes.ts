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

// Public routes
router.get('/', asyncHandler(tagController.listTags.bind(tagController)));

// Protected routes (admin only)
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  asyncHandler(tagController.createTag.bind(tagController))
);

router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  asyncHandler(tagController.updateTag.bind(tagController))
);

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  asyncHandler(tagController.deleteTag.bind(tagController))
);

export default router;
