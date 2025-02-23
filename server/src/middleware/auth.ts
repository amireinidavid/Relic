import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtVerify, JWTPayload } from "jose";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies.accessToken;

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded as { userId: string; email: string; role: string };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticateJwt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    res
      .status(401)
      .json({ success: false, error: "Access token is not present" });
    return;
  }

  try {
    const { payload } = await jwtVerify(
      accessToken,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    const user = payload as JWTPayload & {
      userId: string;
      email: string;
      role: string;
    };

    req.user = {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (e) {
    console.error("JWT Verification Error:", e);
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
};

// New middleware for optional authentication
export const optionalAuthenticateJwt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    next();
    return;
  }

  try {
    const { payload } = await jwtVerify(
      accessToken,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    const user = payload as JWTPayload & {
      userId: string;
      email: string;
      role: string;
    };

    req.user = {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (e) {
    // If token is invalid, continue without user
    next();
  }
};

export const isSuperAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user && req.user.role === "SUPER_ADMIN") {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: "Access denied! Super admin access required",
    });
  }
};
