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
  let decodedPayload;
  if (!secretKey) throw InternalError;
  try {
    decodedPayload = jwt.verify(token, secretKey);
  } catch (e) {
    const err = e as JsonWebTokenError;
    if (err.name === "JsonWebTokenError") {
      throw new InvalidToken();
    }

    if (err.name === "TokenExpiredError") {
      throw new InvalidToken("expired token");
    }

    throw InternalError;
  }
  return decodedPayload;
};

export function generateAuthToken(payload: {
  id: number;
  email: string;
  name: string;
}): string {
  return jwt.sign(payload, secretKey, {
    expiresIn: "1h",
  });
}
