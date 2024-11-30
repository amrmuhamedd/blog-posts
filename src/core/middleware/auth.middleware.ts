import { Request, Response, NextFunction } from "express";
import { verifyAndDecodeToken } from "../utils/auth";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.get("Authorization");

  if (!authHeader || authHeader === "") {
    res.status(401).json({
      error: {
        type: "INVALID_TOKEN",
        message: "token was not submitted",
        statusCode: 401,
      },
    });
    return;
  }

  const authHeaderParts = authHeader.split(" ");
  const token = authHeaderParts[1];
  try {
    const tokenPayload = verifyAndDecodeToken(token) as {
      id: number;
      name: string;
      email: string;
      role: "USER" | "ADMIN";
    };
    req.user = tokenPayload;
    next();
    return;
  } catch (e) {
    const err = e as { type: string; message: string };
    res.status(401).json({
      error: {
        type: err.type,
        message: err.message,
        statusCode: 401,
      },
    });
    return;
  }
};

export default authMiddleware;