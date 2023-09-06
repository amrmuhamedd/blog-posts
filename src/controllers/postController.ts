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

    return res.status(201).json({ newPost });
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

export const updatePost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { title, content } = req.body;
  const user = req?.user;

  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.userId !== user?.id) {
      return res
        .status(403)
        .json({ error: "You are not authorized to edit this post" });
    }

    const updatedPost = await prisma.post.update({
      where: { id: parseInt(postId) },
      data: { title, content },
    });

    return res.status(200).json({ updatedPost });
  } catch (error) {
    return res.status(500).json({ error: "Failed to edit post" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.userId !== req?.user?.id) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this post" });
    }

    await prisma.post.delete({
      where: { id: parseInt(postId) },
    });

    return res.status(200).json({ message: "post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete post" });
  }
};
