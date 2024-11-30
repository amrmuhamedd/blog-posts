import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PaginationResponse, pagination } from "../types/responses/pagination";
import { IPost } from "../types/post";
import { IUser } from "../types/user";
import { BasResponse } from "../types/responses/baseResponse";
import { DeleteResponse } from "../types/responses/deletResponse";
import { CreatePostDto, UpdatePostDto } from "../dto/post.dto";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

const prisma = new PrismaClient();

export const createPost = async (
  req: Request,
  res: Response
): BasResponse<IPost> => {
  try {
    const postDto = plainToClass(CreatePostDto, req.body);
    const errors = await validate(postDto);
    
    if (errors.length > 0) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: errors.map(error => ({
          property: error.property,
          constraints: error.constraints
        }))
      });
    }

    const userId = req.user?.id as number;

    const newPost = await prisma.post.create({
      data: {
        ...postDto,
        userId,
      },
    });

    return res.status(201).json({ newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ error: "Post creation failed" });
  }
};

export const ListPosts = async (
  req: Request,
  res: Response
): PaginationResponse<IUser> => {
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

    const response: pagination<IPost> = {
      currentPage: Number(page),
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

export const updatePost = async (
  req: Request,
  res: Response
): BasResponse<IPost> => {
  try {
    const postDto = plainToClass(UpdatePostDto, req.body);
    const errors = await validate(postDto);
    
    if (errors.length > 0) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: errors.map(error => ({
          property: error.property,
          constraints: error.constraints
        }))
      });
    }

    const postId = parseInt(req.params.postId);
    const userId = req.user?.id as number;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to update this post" });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: postDto,
    });

    return res.status(200).json({ updatedPost });
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({ error: "Post update failed" });
  }
};

export const deletePost = async (
  req: Request,
  res: Response
): DeleteResponse => {
  const { postId } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.userId !== req?.user?.id) {
      return res.status(403).json({ error: "You are not authorized to delete this post" });
    }

    await prisma.post.delete({
      where: { id: parseInt(postId) },
    });

    return res.status(200).json({ message: "post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete post" });
  }
};
