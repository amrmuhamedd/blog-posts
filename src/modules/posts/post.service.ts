import { prisma } from '../../core/database/prisma.service';
import { PostStatus, Prisma } from '@prisma/client';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { NotFoundError } from '../../core/errors/not-found.error';
import { ForbiddenError } from '../../core/errors/forbidden.error';
import { PaginationParams } from '../../core/interfaces/pagination.interface';

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

  async getPost(postId: number) {
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

    return post;
  }

  async createPost(userId: number, data: CreatePostDto) {
    const { tags = [], categories = [], ...postData } = data;

    return prisma.post.create({
      data: {
        ...postData,
        userId,
        categories: {
          create: categories.map(categoryId => ({
            category: {
              connect: { id: categoryId }
            }
          }))
        },
        tags: {
          create: tags.map(tagId => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        }
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
  }

  async updatePost(postId: number, userId: number, data: UpdatePostDto) {
    const post = await this.getPost(postId);

    if (post.userId !== userId) {
      throw new ForbiddenError('You are not authorized to update this post');
    }

    const { tags, categories, ...updateData } = data;

    const updateOperations: Prisma.PostUpdateInput = {
      ...updateData
    };

    if (tags !== undefined) {
      updateOperations.tags = {
        deleteMany: {},
        create: tags.map(tagId => ({
          tag: { connect: { id: tagId } }
        }))
      };
    }

    if (categories !== undefined) {
      updateOperations.categories = {
        deleteMany: {},
        create: categories.map(categoryId => ({
          category: { connect: { id: categoryId } }
        }))
      };
    }

    return prisma.post.update({
      where: { id: postId },
      data: updateOperations,
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
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
  }

  async deletePost(postId: number, userId: number) {
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenError('Not authorized to delete this post');
    }

    await prisma.post.delete({
      where: { id: postId }
    });
  }
}

export const postService = PostService.getInstance();
