import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;  // Note: lowercase 'string' for consistency
  };
}

interface JwtPayload {
  id: string;
  email: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "hello";

export default function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {  // Note: return type is void, but we can still call next()
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      msg: "No Token"
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = {
      id: payload.id,
      email: payload.email
    };
    // CRITICAL: Call next() here to proceed to the route handler
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({
      msg: "Invalid Credentials"
    });
    return;
  }
}