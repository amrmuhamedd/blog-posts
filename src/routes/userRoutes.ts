import express from "express";
import { registrationDto } from "../validation/register.dto";
import { loginUser, registerUser } from "../controllers/userController";
import { loginDto } from "../validation/login.dto";

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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Amr Mohamed
 *               email:
 *                 type: string
 *                 example: amr@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       '201':
 *         description: User registered successfully
 *       '400':
 *         description: Bad request, validation failed
 *       '500':
 *         description: Internal server error
 */
router.post("/register", registrationDto, registerUser);

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
router.post("/login", loginDto, loginUser);

export default router;
