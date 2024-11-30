import bcrypt from "bcrypt";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import InvalidToken from "../errors/InvalidToken";
import InternalError from "../errors/InternalError";

const secretKey = process.env.SECRET_KEY as string;

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export const verifyAndDecodeToken = (token: string) => {
  if (!secretKey) {
    throw new InternalError("Unauthorized");
  }

  try {
    const decodedToken = jwt.verify(token, secretKey);
    return decodedToken;
  } catch (error) {
    const jwtError = error as JsonWebTokenError;

    switch (jwtError.name) {
      case "JsonWebTokenError":
        throw new InvalidToken();
      case "TokenExpiredError":
        throw new InvalidToken("expired token");
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
