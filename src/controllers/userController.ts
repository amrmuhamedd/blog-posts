import { Request, Response } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { generateAuthToken } from "../utils/auth";

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    const token = await generateAuthToken(user);
    return res.status(201).json({ user, token });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ error: "Registration failed" });
  }
};
