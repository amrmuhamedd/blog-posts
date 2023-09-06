// postController.ts

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPost = async (req: Request, res: Response) => {
  const { title, content } = req.body;

  try {
    const userId = req.user?.id as number;

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

export const ListPosts = async (req: Request, res: Response) => {
  const { page = 1, pageSize = 10 } = req.query;

  try {
    const skip = (Number(page) - 1) * Number(pageSize);

    const posts = await prisma.post.findMany({
      skip,
      take: Number(pageSize),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const totalPosts = await prisma.post.count();

    const totalPages = Math.ceil(totalPosts / Number(pageSize));

    const nextPage = Number(page) < totalPages ? Number(page) + 1 : null;
    const prevPage = Number(page) > 1 ? Number(page) - 1 : null;

    const response = {
      currentPage: page,
      nextPage,
      prevPage,
      totalPages,
      totalDocs: totalPosts,
      data: posts,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error listing posts:", error);
    return res.status(500).json({ error: "Failed to list posts" });
  }
};
