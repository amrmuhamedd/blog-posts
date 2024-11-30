import express from "express";
import {
  ListPosts,
  createPost,
  deletePost,
  updatePost,
} from "../controllers/postController";
import ensureAuthenticatedUser from "../middlewares/ensureAuthenticatedUser";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: Operations related to posts
 */

/**
 * @swagger
 * /api/posts/list:
 *   get:
 *     summary: List all posts with pagination
 *     tags:
 *       - Posts
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
 *         description: Number of posts per page
 *     responses:
 *       '200':
 *         description: Successful response
 *       '500':
 *         description: Internal server error
 */
router.get("/", ListPosts);

/**
 * @swagger
 * /api/posts/create:
 *   post:
 *     summary: Create a new post
 *     tags:
 *       - Posts
 *     security:
 *       - BearerAuth: []  # Requires authentication via JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: New Post
 *               content:
 *                 type: string
 *                 example: This is the content of the post.
 *     responses:
 *       '201':
 *         description: Post created successfully
 *       '401':
 *         description: Unauthorized, authentication required
 *       '500':
 *         description: Internal server error
 */
router.post("/create", ensureAuthenticatedUser, createPost);

/**
 * @swagger
 * /api/posts/edit/{postId}:
 *   put:
 *     summary: Edit a user-related post
 *     tags:
 *       - Posts
 *     security:
 *       - BearerAuth: []  # Requires authentication via JWT token
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the post to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Post Title
 *               content:
 *                 type: string
 *                 example: This is the updated content of the post.
 *     responses:
 *       '200':
 *         description: Post edited successfully
 *       '401':
 *         description: Unauthorized, authentication required
 *       '404':
 *         description: Post not found
 *       '403':
 *         description: Forbidden, user is not authorized to edit this post
 *       '500':
 *         description: Internal server error
 */

router.put("/edit/:postId", ensureAuthenticatedUser, updatePost);

/**
 * @swagger
 * /api/posts/delete/{postId}:
 *   delete:
 *     summary: Delete a user-related post
 *     tags:
 *       - Posts
 *     security:
 *       - BearerAuth: []  # Requires authentication via JWT token
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the post to delete
 *     responses:
 *       '204':
 *         description: Post deleted successfully
 *       '401':
 *         description: Unauthorized, authentication required
 *       '404':
 *         description: Post not found
 *       '403':
 *         description: Forbidden, user is not authorized to delete this post
 *       '500':
 *         description: Internal server error
 */
router.delete("/delete/:postId", ensureAuthenticatedUser, deletePost);

export default router;
