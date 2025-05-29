import { Router } from "express";
import {
  registerController,
  loginController,
} from "../controllers/auth.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { registerSchema, loginSchema } from "../validations/auth.validation";

const router = Router();

router.post("/register", validateRequest(registerSchema), registerController);
router.post("/login", validateRequest(loginSchema), loginController);

export default router;
