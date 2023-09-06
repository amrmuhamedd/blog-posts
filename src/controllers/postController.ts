// postController.ts

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPost = async (req: Request, res: Response) => {
  const { title, content } = req.body;

  try {
    const userId = req.user?.id as number;

    // Create a new post associated with the user
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        userId,
      },
    });

    return res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ error: "Post creation failed" });
  }
};
