import express from "express";
import { loginUser, registerUser } from "../controllers/userController";
import { upload } from "../middleware/multer";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Operations related to users
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Amr Mohamed
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               phone:
 *                 type: string
 *                 example: "1234567890"
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *                 example: USER
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *               bio:
 *                 type: string
 *                 example: A short bio about me
 *     responses:
 *       '201':
 *         description: User registered successfully
 *       '400':
 *         description: Bad request, validation failed
 *       '500':
 *         description: Internal server error
 */
router.post("/register", upload.single('file') as any, registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Authenticate a user and generate a JWT token
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: amr@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       '200':
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       '401':
 *         description: Authentication failed
 *       '500':
 *         description: Internal server error
 */
router.post("/login", loginUser);

export default router;
