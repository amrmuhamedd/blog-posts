import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { comparePasswords, generateAuthToken } from "../utils/auth";
import { BasResponse } from "../types/responses/baseResponse";
import { IUser } from "../types/user";
import { CreateCustomerInput, LoginDto } from "../dto/user.dto";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { uploadImage } from "../utils/upload";

const prisma = new PrismaClient();

export const registerUser = async (
  req: Request,
  res: Response
): BasResponse<{ user: IUser; token: string }> => {
  try {
    // Transform request body to DTO
    const userDto = plainToClass(CreateCustomerInput, req.body);
    
    // Validate DTO
    const errors = await validate(userDto);
    if (errors.length > 0) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: errors.map(error => ({
          property: error.property,
          constraints: error.constraints
        }))
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: userDto.email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    let profile_picture = '';
    if (req.file) {
      profile_picture = await uploadImage(req.file);
    }

    const hashedPassword = await bcrypt.hash(userDto.password, 10);

    const user = await prisma.user.create({
      data: {
        name: userDto.name,
        email: userDto.email,
        password: hashedPassword,
        role: userDto.role,
        phone: userDto.phone,
        profile_picture: profile_picture,
        bio: userDto.bio || ''
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true
      },
    });

    const token = await generateAuthToken(user);
    return res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: "Registration failed" });
  }
};

export const loginUser = async (
  req: Request,
  res: Response
): BasResponse<{ token: string }> => {
  try {
    // Transform and validate request body using LoginDto
    const loginDto = plainToClass(LoginDto, req.body);
    const errors = await validate(loginDto);
    
    if (errors.length > 0) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: errors.map(error => ({
          property: error.property,
          constraints: error.constraints
        }))
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await comparePasswords(loginDto.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateAuthToken(user);
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
