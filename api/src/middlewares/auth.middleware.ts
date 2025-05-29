import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  user: {
    id: string;
    email: string;
  };
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload["user"];
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined for auth middleware.");
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET not available during request processing.");
    res
      .status(500)
      .json({ errors: [{ message: "Server configuration error" }] });
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      errors: [{ message: "No token provided, authorization denied" }],
    });
    return;
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    res.status(401).json({
      errors: [{ message: 'Token error, format is "Bearer <token>"' }],
    });
    return;
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err);
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ errors: [{ message: "Token is expired" }] });
      return;
    }
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ errors: [{ message: "Token is not valid" }] });
      return;
    }
    res.status(401).json({ errors: [{ message: "Token is not valid" }] });
    return;
  }
};
