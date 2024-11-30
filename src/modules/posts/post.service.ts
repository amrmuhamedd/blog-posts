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
          tags: true,
          category: true
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
        tags: true,
        category: true
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

  async createPost(userId: number, createPostDto: CreatePostDto) {
    if (createPostDto.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: createPostDto.categoryId }
      });

      if (!category) {
        throw new NotFoundError('Category not found');
      }
    }

    if (createPostDto.tags) {
      const existingTags = await prisma.tag.findMany({
        where: { id: { in: createPostDto.tags } }
      });

      if (existingTags.length !== createPostDto.tags.length) {
        throw new NotFoundError('One or more tags not found');
      }
    }

    if (createPostDto.status === PostStatus.Published && createPostDto.publish_at) {
      if (createPostDto.publish_at < new Date()) {
        throw new Error('Publish date cannot be in the past');
      }
    }

    return prisma.post.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
        userId,
        categoryId: createPostDto.categoryId,
        status: createPostDto.status,
        publish_at: createPostDto.publish_at,
        tags: createPostDto.tags ? {
          create: createPostDto.tags.map(tagId => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        } : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
  }

  async updatePost(postId: number, userId: number, updatePostDto: UpdatePostDto) {
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenError('Not authorized to update this post');
    }

    if (updatePostDto.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: updatePostDto.categoryId }
      });

      if (!category) {
        throw new NotFoundError('Category not found');
      }
    }

    if (updatePostDto.tags) {
      const existingTags = await prisma.tag.findMany({
        where: { id: { in: updatePostDto.tags } }
      });

      if (existingTags.length !== updatePostDto.tags.length) {
        throw new NotFoundError('One or more tags not found');
      }
    }

    if (updatePostDto.status === PostStatus.Published && updatePostDto.publish_at) {
      if (updatePostDto.publish_at < new Date()) {
        throw new Error('Publish date cannot be in the past');
      }
    }

    return prisma.post.update({
      where: { id: postId },
      data: {
        ...(updatePostDto.title && { title: updatePostDto.title }),
        ...(updatePostDto.content && { content: updatePostDto.content }),
        ...(updatePostDto.status && { status: updatePostDto.status }),
        ...(updatePostDto.publish_at && { publish_at: updatePostDto.publish_at }),
        ...(updatePostDto.categoryId !== undefined && { categoryId: updatePostDto.categoryId }),
        ...(updatePostDto.tags && {
          tags: {
            deleteMany: {},
            create: updatePostDto.tags.map(tagId => ({
              tag: {
                connect: { id: tagId }
              }
            }))
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
        category: true,
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
