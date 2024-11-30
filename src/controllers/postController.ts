import { Request, Response } from "express";
import { PrismaClient, PostStatus, Prisma } from "@prisma/client";
import { PaginationResponse, createPagination } from "../types/responses/pagination";
import { IPost } from "../types/post";
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
    const data = req.body as CreatePostDto;
    const post = await prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        userId: req.user!.id,
        status: data.status,
        publish_at: data.publish_at,
        ...(data.tags && {
          tags: {
            connect: data.tags.map(tagId => ({ id: tagId }))
          }
        })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: true
      }
    });
    return res.status(201).json({ data: post });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ error: "Post creation failed" });
  }
};

export const ListPosts = async (
  req: Request,
  res: Response
): PaginationResponse<IPost> => {
  try {
    const { page = 1, pageSize = 10, status, tag } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    // Type guard and conversion for status
    const validStatus: PostStatus | undefined = status && 
      ['Draft', 'Published', 'Scheduled'].includes(status as string) 
        ? status as PostStatus 
        : undefined;

    const where: Prisma.PostWhereInput = {
      ...(validStatus && { status: validStatus }),
      ...(tag && {
        tags: {
          some: {
            id: Number(tag)
          }
        }
      }),
      OR: validStatus ? [
        { status: validStatus, publish_at: null },
        { status: validStatus, publish_at: { lte: new Date() } }
      ] : undefined
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        skip,
        take: Number(pageSize),
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          tags: true
        },
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.post.count({ where })
    ]);

    return res.status(200).json({
      data: createPagination({
        data: posts,
        page: Number(page),
        pageSize: Number(pageSize),
        total
      })
    });
  } catch (error) {
    console.error("Error listing posts:", error);
    return res.status(500).json({ error: "Failed to retrieve posts" });
  }
};

export const updatePost = async (
  req: Request,
  res: Response
): BasResponse<IPost> => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.user?.id as number;
    
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

    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existingPost.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to update this post" });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        ...(postDto.title && { title: postDto.title }),
        ...(postDto.content && { content: postDto.content }),
        ...(postDto.status && { status: postDto.status }),
        ...(postDto.publish_at && { publish_at: postDto.publish_at }),
      },
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
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.user?.id as number;

    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this post" });
    }

    await prisma.post.delete({
      where: { id: postId }
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({ error: "Post deletion failed" });
  }
};
