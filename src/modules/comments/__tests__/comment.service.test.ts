import { CommentService } from '../comment.service';
import { prisma } from '../../../core/database/prisma.service';
import { auditService } from '../../../core/services/audit.service';
import { NotFoundError } from '../../../core/errors/not-found.error';
import { ForbiddenError } from '../../../core/errors/forbidden.error';
import { EntityType } from '@prisma/client';

// Mock dependencies
jest.mock('../../../core/database/prisma.service', () => ({
  prisma: {
    comment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    post: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../../../core/services/audit.service', () => ({
  auditService: {
    log: jest.fn(),
  },
}));

describe('CommentService', () => {
  let commentService: CommentService;
  const userId = 1;

  beforeEach(() => {
    commentService = CommentService.getInstance();
    jest.clearAllMocks();
  });

  describe('listComments', () => {
    const postId = 1;
    const mockComments = [
      {
        id: 1,
        content: 'Test comment',
        user: { id: 1, name: 'User 1', email: 'user1@test.com', profile_picture: null },
        replies: [],
      },
      {
        id: 2,
        content: 'Test reply',
        user: { id: 2, name: 'User 2', email: 'user2@test.com', profile_picture: null },
        replies: [],
      },
    ];

    it('should list all comments for a post', async () => {
      (prisma.comment.findMany as jest.Mock).mockResolvedValue(mockComments);

      const result = await commentService.listComments(postId);

      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { post_id: postId },
        include: expect.any(Object),
        orderBy: { created_at: 'desc' },
      });
      expect(result).toEqual(mockComments);
    });
  });

  describe('getComment', () => {
    const commentId = 1;
    const mockComment = {
      id: commentId,
      content: 'Test comment',
      user_id: userId,
      user: { id: userId, name: 'User 1', email: 'user1@test.com', profile_picture: null },
      replies: [],
    };

    it('should get a comment by id', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);

      const result = await commentService.getComment(commentId);

      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId },
        include: expect.any(Object),
      });
      expect(auditService.log).toHaveBeenCalledWith(userId, 'READ', EntityType.Comment, commentId);
      expect(result).toEqual(mockComment);
    });

    it('should throw NotFoundError if comment does not exist', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(commentService.getComment(commentId))
        .rejects.toThrow('Comment not found');
    });
  });

  describe('createComment', () => {
    const mockCreateDto = {
      content: 'Test comment',
      post_id: 1,
    };

    const mockComment = {
      id: 1,
      ...mockCreateDto,
      user_id: userId,
      user: { id: userId, name: 'User 1', email: 'user1@test.com', profile_picture: null },
    };

    it('should create a new comment', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({ id: mockCreateDto.post_id });
      (prisma.comment.create as jest.Mock).mockResolvedValue(mockComment);

      const result = await commentService.createComment(userId, mockCreateDto);

      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: mockCreateDto.post_id },
      });
      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          content: mockCreateDto.content,
          post_id: mockCreateDto.post_id,
          user_id: userId,
          parent_id: undefined,
        },
        include: expect.any(Object),
      });
      expect(auditService.log).toHaveBeenCalledWith(userId, 'CREATE', EntityType.Comment, mockComment.id);
      expect(result).toEqual(mockComment);
    });

    it('should throw NotFoundError if post does not exist', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(commentService.createComment(userId, mockCreateDto))
        .rejects.toThrow('Post not found');
      expect(prisma.comment.create).not.toHaveBeenCalled();
    });

    it('should create a reply to another comment', async () => {
      const mockReplyDto = {
        ...mockCreateDto,
        parent_id: 2,
      };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue({ id: mockCreateDto.post_id });
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue({ id: mockReplyDto.parent_id });
      (prisma.comment.create as jest.Mock).mockResolvedValue({ ...mockComment, parent_id: mockReplyDto.parent_id });

      const result = await commentService.createComment(userId, mockReplyDto);

      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: mockReplyDto.parent_id },
      });
      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          content: mockReplyDto.content,
          post_id: mockReplyDto.post_id,
          user_id: userId,
          parent_id: mockReplyDto.parent_id,
        },
        include: expect.any(Object),
      });
      expect(result.parent_id).toBe(mockReplyDto.parent_id);
    });

    it('should throw NotFoundError if parent comment does not exist', async () => {
      const mockReplyDto = {
        ...mockCreateDto,
        parent_id: 999,
      };

      (prisma.post.findUnique as jest.Mock).mockResolvedValue({ id: mockCreateDto.post_id });
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(commentService.createComment(userId, mockReplyDto))
        .rejects.toThrow('Parent comment not found');
      expect(prisma.comment.create).not.toHaveBeenCalled();
    });
  });

  describe('updateComment', () => {
    const commentId = 1;
    const mockUpdateDto = {
      content: 'Updated comment',
    };

    const mockComment = {
      id: commentId,
      content: 'Original comment',
      user_id: userId,
    };

    const mockUpdatedComment = {
      ...mockComment,
      content: mockUpdateDto.content,
      user: { id: userId, name: 'User 1', email: 'user1@test.com', profile_picture: null },
    };

    it('should update a comment', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);
      (prisma.comment.update as jest.Mock).mockResolvedValue(mockUpdatedComment);

      const result = await commentService.updateComment(commentId, userId, mockUpdateDto);

      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: commentId },
        data: {
          content: mockUpdateDto.content,
          updated_at: expect.any(Date),
        },
        include: expect.any(Object),
      });
      expect(auditService.log).toHaveBeenCalledWith(userId, 'UPDATE', EntityType.Comment, commentId);
      expect(result).toEqual(mockUpdatedComment);
    });

    it('should throw NotFoundError if comment does not exist', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(commentService.updateComment(commentId, userId, mockUpdateDto))
        .rejects.toThrow('Comment not found');
      expect(prisma.comment.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError if user is not the comment author', async () => {
      const differentUserId = 2;
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);

      await expect(commentService.updateComment(commentId, differentUserId, mockUpdateDto))
        .rejects.toThrow('You can only update your own comments');
      expect(prisma.comment.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteComment', () => {
    const commentId = 1;
    const mockComment = {
      id: commentId,
      content: 'Test comment',
      user_id: userId,
    };

    it('should delete a comment', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);

      await commentService.deleteComment(commentId, userId);

      expect(prisma.comment.delete).toHaveBeenCalledWith({
        where: { id: commentId },
      });
      expect(auditService.log).toHaveBeenCalledWith(userId, 'DELETE', EntityType.Comment, commentId);
    });

    it('should throw NotFoundError if comment does not exist', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(commentService.deleteComment(commentId, userId))
        .rejects.toThrow('Comment not found');
      expect(prisma.comment.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError if user is not the comment author', async () => {
      const differentUserId = 2;
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);

      await expect(commentService.deleteComment(commentId, differentUserId))
        .rejects.toThrow('You can only delete your own comments');
      expect(prisma.comment.delete).not.toHaveBeenCalled();
    });
  });
});
