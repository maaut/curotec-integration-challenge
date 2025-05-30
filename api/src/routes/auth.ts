import { Router } from "express";
import {
  registerController,
  loginController,
} from "../controllers/auth.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { registerSchema, loginSchema } from "../validations/auth.validation";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Creates a new user account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterDto'
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid request body (e.g., email already exists, password too short).
 *       500:
 *         description: An unexpected error occurred.
 */
router.post("/register", validateRequest(registerSchema), registerController);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Log in an existing user
 *     description: Authenticates a user and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDto'
 *     responses:
 *       200:
 *         description: User logged in successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid request body (e.g., missing email or password).
 *       401:
 *         description: Invalid credentials (e.g., incorrect email or password).
 *       500:
 *         description: An unexpected error occurred.
 */
router.post("/login", validateRequest(loginSchema), loginController);

export default router;
