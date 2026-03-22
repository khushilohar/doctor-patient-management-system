import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Extend Request
export interface AuthRequest extends Request {
  user?: JwtPayload & {
    userId: number;
    userType: "superadmin" | "admin" | "user";
    policies: string[];
  };
}

// ==========================
// 🔐 AUTH MIDDLEWARE
// ==========================
export const userAction = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token missing" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AuthRequest["user"]; // ✅ type-safe

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = decoded;

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    return res.status(401).json({ message: "Invalid token" });
  }
};

// ==========================
// 🛡️ RBAC MIDDLEWARE
// ==========================
export const userPolicy = (resource: string, action: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // ✅ SUPERADMIN BYPASS
      if (user.userType === "superadmin") {
        return next();
      }

      const key = `${resource}:${action}`;

      // ✅ Check policies array
      if (!user.policies || !Array.isArray(user.policies)) {
        return res.status(403).json({
          message: "No permissions assigned",
        });
      }

      // ✅ Permission check
      if (!user.policies.includes(key)) {
        return res.status(403).json({
          message: `Permission denied: ${key}`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  };
};