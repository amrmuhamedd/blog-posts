import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const secretKey = process.env.SECRET_KEY as string;

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateAuthToken(payload: {
  id: number;
  email: string;
  name: string;
}): string {
  return jwt.sign(payload, secretKey, {
    expiresIn: "1h",
  });
}
