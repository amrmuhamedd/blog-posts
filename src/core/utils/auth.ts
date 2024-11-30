import bcrypt from "bcrypt";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import InternalError from "../errors/internal.error";
import { InvalidToken } from "../errors/invalid-token.error";

const secretKey = process.env.SECRET_KEY as string;

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export const verifyAndDecodeToken = (token: string): Record<string, unknown> => {
  if (!secretKey) {
    throw new InternalError("Unauthorized");
  }

  try {
    return jwt.verify(token, secretKey) as Record<string, unknown>;
  } catch (error) {
    const jwtError = error as JsonWebTokenError;

    switch (jwtError.name) {
      case "JsonWebTokenError":
        throw new InvalidToken();
      case "TokenExpiredError":
        throw new InvalidToken("Expired token");
      default:
        throw new InternalError("Unauthorized");
    }
  }
};

export function generateAuthToken(payload: {
  id: number;
  email: string;
  name: string;
}): string {
  return jwt.sign(payload, secretKey, {
    expiresIn: "1d",
  });
}