/**
 * @openapi
 * components:
 *   schemas:
 *     RegisterDto:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address.
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           format: password
 *           description: User's password (min 6 characters).
 *           example: "password123"
 *     LoginDto:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address.
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           format: password
 *           description: User's password.
 *           example: "password123"
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token for authentication.
 *         user:
 *           $ref: '#/components/schemas/UserOutput'
 *     UserOutput: # Basic user information returned on auth
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}
