import { Request, Response } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { comparePasswords, generateAuthToken } from "../utils/auth";

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
    return res.status(500).json({ error: "Registration failed" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res
        .status(401)
        .json({ error: "username or password is incorrect" });
    }

    const passwordMatch = await comparePasswords(password, user.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ error: "username or password is incorrect" });
    }

    const token = await generateAuthToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ error: "something went wrong" });
  }
};
