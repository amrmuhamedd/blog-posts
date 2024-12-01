import { prisma } from '../../core/database/prisma.service';
import { PostStatus, Prisma, EntityType } from '@prisma/client';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { NotFoundError } from '../../core/errors/not-found.error';
import { ForbiddenError } from '../../core/errors/forbidden.error';
import { PaginationParams } from '../../core/interfaces/pagination.interface';
import { auditService } from '../../core/services/audit.service';

export class PostService {
  private static instance: PostService;

  private constructor() {}

  public static getInstance(): PostService {
    if (!PostService.instance) {
      PostService.instance = new PostService();
    }
    return PostService.instance;
  }

  async listPosts(params: PaginationParams & { status?: PostStatus; tag?: number; userId?: number }) {
    const { page = 1, pageSize = 10, status, tag, userId } = params;
    const skip = (Number(page) - 1) * Number(pageSize);

    const where: Prisma.PostWhereInput = {
      ...(status && { status }),
      ...(tag && {
        tags: {
          some: { tag: { id: Number(tag) } }
        }
      }),
      ...(userId && { userId: Number(userId) }),
      OR: status === PostStatus.Published ? [
        { status, publish_at: null },
        { status, publish_at: { lte: new Date() } }
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
          categories: {
            include: {
              category: true
            }
          },
          tags: true
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.post.count({ where })
    ]);

    return {
      data: posts,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total
      }
    };
  }

  async getPost(postId: number, userId?: number) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        tags: true
      }
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (post.status === PostStatus.Published && post.publish_at) {
      if (post.publish_at > new Date()) {
        throw new ForbiddenError('This post is not yet published');
      }
    }

    if (userId) {
      await auditService.log(userId, 'READ', EntityType.Post, post.id);
    }
    return post;
  }

  async createPost(userId: number, data: CreatePostDto) {
    const post = await prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        status: data.status,
        publish_at: data.publish_at,
        userId,
        categories: {
          create: data.categories?.map(categoryId => ({
            category: {
              connect: { id: categoryId }
            }
          }))
        },
        tags: {
          create: data.tags?.map(tagId => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        tags: true
      }
    });

    await auditService.log(userId, 'CREATE', EntityType.Post, post.id);
    return post;
  }

  async updatePost(postId: number, userId: number, data: UpdatePostDto) {
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenError('You can only update your own posts');
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title: data.title,
        content: data.content,
        status: data.status,
        publish_at: data.publish_at,
        categories: {
          deleteMany: {},
          create: data.categories?.map(categoryId => ({
            category: {
              connect: { id: categoryId }
            }
          }))
        },
        tags: {
          deleteMany: {},
          create: data.tags?.map(tagId => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        tags: true
      }
    });

    await auditService.log(userId, 'UPDATE', EntityType.Post, postId);
    return updatedPost;
  }

  async deletePost(postId: number, userId: number) {
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenError('You can only delete your own posts');
    }

    await prisma.post.delete({
      where: { id: postId }
    });

    await auditService.log(userId, 'DELETE', EntityType.Post, postId);
  }
}

export const postService = PostService.getInstance();
