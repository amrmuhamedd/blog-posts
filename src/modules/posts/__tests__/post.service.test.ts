import { PostService } from '../post.service';
import { prisma } from '../../../core/database/prisma.service';
import { auditService } from '../../../core/services/audit.service';
import { PostStatus, EntityType, ReactionType } from '@prisma/client';

// Mock dependencies
jest.mock('../../../core/database/prisma.service', () => ({
  prisma: {
    post: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    reaction: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

jest.mock('../../../core/services/audit.service', () => ({
  auditService: {
    log: jest.fn(),
  },
}));

describe('PostService', () => {
  let postService: PostService;
  const userId = 1;

  beforeEach(() => {
    postService = PostService.getInstance();
    jest.clearAllMocks();
  });

  describe('listPosts', () => {
    const mockPosts = [
      {
        id: 1,
        title: 'Test Post 1',
        content: 'Content 1',
        status: PostStatus.Published,
        userId: 1,
        user: { id: 1, name: 'User 1', email: 'user1@test.com' },
        categories: [],
        tags: [],
      },
      {
        id: 2,
        title: 'Test Post 2',
        content: 'Content 2',
        status: PostStatus.Draft,
        userId: 1,
        user: { id: 1, name: 'User 1', email: 'user1@test.com' },
        categories: [],
        tags: [],
      },
    ];

    it('should list posts with pagination', async () => {
      const params = { page: 1, pageSize: 10 };
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (prisma.post.count as jest.Mock).mockResolvedValue(2);

      const result = await postService.listPosts(params);

      expect(prisma.post.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        include: expect.any(Object),
        orderBy: { created_at: 'desc' },
      });
      expect(result).toEqual({
        data: mockPosts,
        pagination: {
          page: 1,
          pageSize: 10,
          total: 2,
        },
      });
    });

    it('should filter posts by status', async () => {
      const params = { page: 1, pageSize: 10, status: PostStatus.Published };
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPosts[0]]);
      (prisma.post.count as jest.Mock).mockResolvedValue(1);

      const result = await postService.listPosts(params);

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: PostStatus.Published,
          }),
        })
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe(PostStatus.Published);
    });

    it('should filter posts by tag', async () => {
      const params = { page: 1, pageSize: 10, tag: 1 };
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (prisma.post.count as jest.Mock).mockResolvedValue(2);

      await postService.listPosts(params);

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tags: {
              some: { tag: { id: 1 } },
            },
          }),
        })
      );
    });

    it('should filter posts by userId', async () => {
      const params = { page: 1, pageSize: 10, userId: 1 };
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (prisma.post.count as jest.Mock).mockResolvedValue(2);

      await postService.listPosts(params);

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 1,
          }),
        })
      );
    });
  });

  describe('getPost', () => {
    const postId = 1;
    const mockPost = {
      id: postId,
      title: 'Test Post',
      content: 'Test content',
      status: PostStatus.Published,
      publish_at: null,
      userId: 1,
      user: { id: 1, name: 'User 1', email: 'user1@test.com' },
      categories: [],
      tags: [],
      reactions: {
        likes: 5,
        loves: 2,
      },
      userReaction: null
    };

    it('should get a post by id', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.reaction.groupBy as jest.Mock).mockResolvedValue([
        { reaction: ReactionType.Like, _count: 5 },
        { reaction: ReactionType.Love, _count: 2 },
      ]);

      const result = await postService.getPost(postId, userId);

      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
        include: expect.any(Object),
      });
      expect(prisma.reaction.groupBy).toHaveBeenCalledWith({
        by: ['reaction'],
        where: {
          entity_type: EntityType.Post,
          entity_id: postId,
        },
        _count: true,
      });
      expect(auditService.log).toHaveBeenCalledWith(userId, 'READ', EntityType.Post, postId);
      expect(result).toEqual(mockPost);
    });

    it('should get user reaction status if userId is provided', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.reaction.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        user_id: userId,
        entity_type: EntityType.Post,
        entity_id: postId,
        reaction: ReactionType.Like,
      });

      const result = await postService.getPost(postId, userId);

      expect(prisma.reaction.findUnique).toHaveBeenCalledWith({
        where: {
          user_id_entity_type_entity_id: {
            user_id: userId,
            entity_type: EntityType.Post,
            entity_id: postId,
          },
        },
      });
      expect(result.userReaction).toBe(ReactionType.Like);
    });

    it('should throw NotFoundError if post does not exist', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(postService.getPost(postId, userId))
        .rejects.toThrow('Post not found');
    });

    it('should throw ForbiddenError if post is scheduled for future publication', async () => {
      const futurePost = {
        ...mockPost,
        publish_at: new Date(Date.now() + 86400000), // Tomorrow
      };
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(futurePost);

      await expect(postService.getPost(postId, userId))
        .rejects.toThrow('This post is not yet published');
    });
  });

  describe('createPost', () => {
    const mockCreateDto = {
      title: 'New Post',
      content: 'New content',
      status: PostStatus.Draft,
      categories: [1, 2],
      tags: [1],
    };

    const mockCreatedPost = {
      id: 1,
      ...mockCreateDto,
      userId: 1,
      user: { id: 1, name: 'User 1', email: 'user1@test.com' },
      categories: [
        { category: { id: 1, name: 'Category 1' } },
        { category: { id: 2, name: 'Category 2' } },
      ],
      tags: [{ tag: { id: 1, name: 'Tag 1' } }],
    };

    it('should create a new post', async () => {
      (prisma.post.create as jest.Mock).mockResolvedValue(mockCreatedPost);

      const result = await postService.createPost(userId, mockCreateDto);

      expect(prisma.post.create).toHaveBeenCalledWith({
        data: {
          title: mockCreateDto.title,
          content: mockCreateDto.content,
          status: mockCreateDto.status,
          publish_at: undefined,
          userId,
          categories: {
            create: mockCreateDto.categories.map(id => ({
              category: { connect: { id } },
            })),
          },
          tags: {
            create: mockCreateDto.tags.map(id => ({
              tag: { connect: { id } },
            })),
          },
        },
        include: expect.any(Object),
      });
      expect(auditService.log).toHaveBeenCalledWith(userId, 'CREATE', EntityType.Post, mockCreatedPost.id);
      expect(result).toEqual(mockCreatedPost);
    });
  });

  describe('updatePost', () => {
    const postId = 1;
    const mockUpdateDto = {
      title: 'Updated Post',
      content: 'Updated content',
      status: PostStatus.Published,
    };

    const mockPost = {
      id: postId,
      userId,
      title: 'Original Post',
      content: 'Original content',
      status: PostStatus.Draft,
    };

    const mockUpdatedPost = {
      ...mockPost,
      ...mockUpdateDto,
      user: { id: userId, name: 'User 1', email: 'user1@test.com' },
      categories: [],
      tags: [],
    };

    it('should update a post', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.post.update as jest.Mock).mockResolvedValue(mockUpdatedPost);

      const result = await postService.updatePost(postId, userId, mockUpdateDto);

      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: expect.objectContaining({
          title: mockUpdateDto.title,
          content: mockUpdateDto.content,
          status: mockUpdateDto.status,
        }),
        include: expect.any(Object),
      });
      expect(auditService.log).toHaveBeenCalledWith(userId, 'UPDATE', EntityType.Post, postId);
      expect(result).toEqual(mockUpdatedPost);
    });

    it('should throw NotFoundError if post does not exist', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(postService.updatePost(postId, userId, mockUpdateDto))
        .rejects.toThrow('Post not found');
      expect(prisma.post.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError if user is not the post author', async () => {
      const differentUserId = 2;
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);

      await expect(postService.updatePost(postId, differentUserId, mockUpdateDto))
        .rejects.toThrow('You can only update your own posts');
      expect(prisma.post.update).not.toHaveBeenCalled();
    });
  });

  describe('deletePost', () => {
    const postId = 1;
    const mockPost = {
      id: postId,
      userId,
      title: 'Test Post',
      content: 'Test content',
      status: PostStatus.Draft,
    };

    it('should delete a post', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);

      await postService.deletePost(postId, userId);

      expect(prisma.post.delete).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(auditService.log).toHaveBeenCalledWith(userId, 'DELETE', EntityType.Post, postId);
    });

    it('should throw NotFoundError if post does not exist', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(postService.deletePost(postId, userId))
        .rejects.toThrow('Post not found');
      expect(prisma.post.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError if user is not the post author', async () => {
      const differentUserId = 2;
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);

      await expect(postService.deletePost(postId, differentUserId))
        .rejects.toThrow('You can only delete your own posts');
      expect(prisma.post.delete).not.toHaveBeenCalled();
    });
  });

  describe('createReaction', () => {
    const postId = 1;
    const reactionType = ReactionType.Like;

    it('should create a new reaction', async () => {
      (prisma.reaction.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.reaction.create as jest.Mock).mockResolvedValue({
        id: 1,
        user_id: userId,
        entity_type: EntityType.Post,
        entity_id: postId,
        reaction: reactionType,
      });

      const result = await postService.createReaction(postId, userId, reactionType);

      expect(prisma.reaction.create).toHaveBeenCalledWith({
        data: {
          user_id: userId,
          entity_type: EntityType.Post,
          entity_id: postId,
          reaction: reactionType,
        },
      });
      expect(auditService.log).toHaveBeenCalledWith(userId, 'CREATE', EntityType.Reaction, result.id);
      expect(result).toEqual({
        id: 1,
        user_id: userId,
        entity_type: EntityType.Post,
        entity_id: postId,
        reaction: reactionType,
      });
    });

    it('should throw ForbiddenError if user already reacted with the same reaction', async () => {
      (prisma.reaction.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        user_id: userId,
        entity_type: EntityType.Post,
        entity_id: postId,
        reaction: reactionType,
      });

      await expect(postService.createReaction(postId, userId, reactionType))
        .rejects.toThrow('You already reacted with this reaction');
    });
  });

  describe('deleteReaction', () => {
    const postId = 1;
    const reactionId = 1;

    it('should delete a reaction', async () => {
      (prisma.reaction.findUnique as jest.Mock).mockResolvedValue({
        id: reactionId,
        user_id: userId,
        entity_type: EntityType.Post,
        entity_id: postId,
        reaction: ReactionType.Like,
      });

      await postService.deleteReaction(reactionId, userId);

      expect(prisma.reaction.delete).toHaveBeenCalledWith({
        where: { id: reactionId },
      });
      expect(auditService.log).toHaveBeenCalledWith(userId, 'DELETE', EntityType.Reaction, reactionId);
    });

    it('should throw NotFoundError if reaction does not exist', async () => {
      (prisma.reaction.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(postService.deleteReaction(reactionId, userId))
        .rejects.toThrow('Reaction not found');
      expect(prisma.reaction.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError if user is not the reaction author', async () => {
      const differentUserId = 2;
      (prisma.reaction.findUnique as jest.Mock).mockResolvedValue({
        id: reactionId,
        user_id: userId,
        entity_type: EntityType.Post,
        entity_id: postId,
        reaction: ReactionType.Like,
      });

      await expect(postService.deleteReaction(reactionId, differentUserId))
        .rejects.toThrow('You can only delete your own reactions');
      expect(prisma.reaction.delete).not.toHaveBeenCalled();
    });
  });
});
