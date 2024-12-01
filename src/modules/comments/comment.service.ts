import { prisma } from '../../core/database/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { NotFoundError } from '../../core/errors/not-found.error';
import { ForbiddenError } from '../../core/errors/forbidden.error';
import { EntityType } from '@prisma/client';
import { auditService } from '../../core/services/audit.service';

export class CommentService {
  private static instance: CommentService;

  private constructor() {}

  static getInstance(): CommentService {
    if (!CommentService.instance) {
      CommentService.instance = new CommentService();
    }
    return CommentService.instance;
  }

  async listComments(postId: number) {
    return prisma.comment.findMany({
      where: { post_id: postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_picture: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile_picture: true
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async getCommentsByPostId(postId: number) {
    return this.listComments(postId);
  }

  async getComment(commentId: number) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_picture: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile_picture: true
              }
            }
          }
        }
      }
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    await auditService.log(comment.user_id, 'READ', EntityType.Comment, comment.id);
    return comment;
  }

  async createComment(userId: number, data: CreateCommentDto) {
    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: data.post_id }
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // If it's a reply, verify parent comment exists
    if (data.parent_id) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: data.parent_id }
      });

      if (!parentComment) {
        throw new NotFoundError('Parent comment not found');
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        post_id: data.post_id,
        user_id: userId,
        parent_id: data.parent_id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_picture: true
          }
        }
      }
    });

    await auditService.log(userId, 'CREATE', EntityType.Comment, comment.id);
    return comment;
  }

  async updateComment(commentId: number, userId: number, data: UpdateCommentDto) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenError('You can only update your own comments');
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: data.content,
        updated_at: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_picture: true
          }
        }
      }
    });

    await auditService.log(userId, 'UPDATE', EntityType.Comment, commentId);
    return updatedComment;
  }

  async deleteComment(commentId: number, userId: number) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenError('You can only delete your own comments');
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    await auditService.log(userId, 'DELETE', EntityType.Comment, commentId);
  }
}

export const commentService = CommentService.getInstance();
