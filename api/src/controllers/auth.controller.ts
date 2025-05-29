import { Request, Response } from "express";
import * as AuthService from "../services/auth.service";
import { RegisterInput, LoginInput } from "../validations/auth.validation";

export const registerController = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response
): Promise<void> => {
  try {
    const user = await AuthService.registerUser(req.body);

    res.status(201).json(user);

    return;
  } catch (error: any) {
    if (error.message === "Email already in use") {
      res.status(409).json({ errors: [{ message: error.message }] });
      return;
    }
    console.error(
      "Controller - Failed to register user:",
      error.message || error
    );
    res.status(500).json({ errors: [{ message: "Failed to register user" }] });
    return;
  }
};

export const loginController = async (
  req: Request<{}, {}, LoginInput>,
  res: Response
): Promise<void> => {
  try {
    const { token, user } = await AuthService.loginUser(req.body);
    res.json({ token, user });
    return;
  } catch (error: any) {
    if (error.message === "Invalid credentials") {
      res.status(401).json({ errors: [{ message: error.message }] });
      return;
    }
    console.error("Controller - Failed to login user:", error.message || error);
    res.status(500).json({ errors: [{ message: "Failed to login user" }] });
    return;
  }
};
