import { TagService } from '../tag.service';
import { prisma } from '../../../core/database/prisma.service';
import { auditService } from '../../../core/services/audit.service';
import { EntityType } from '@prisma/client';
import { NotFoundError } from '../../../core/errors/not-found.error';

// Mock the prisma client
jest.mock('../../../core/database/prisma.service', () => ({
  prisma: {
    tag: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
  }
}));

// Mock the audit service
jest.mock('../../../core/services/audit.service', () => ({
  auditService: {
    log: jest.fn(),
  }
}));

describe('TagService', () => {
  let tagService: TagService;
  const userId = 1;

  beforeEach(() => {
    tagService = TagService.getInstance();
    jest.clearAllMocks();
  });

  describe('listTags', () => {
    const mockTags = [
      {
        id: 1,
        name: 'Technology',
        description: 'Tech related posts',
        _count: { posts: 5 },
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: 'Programming',
        description: 'Programming related posts',
        _count: { posts: 3 },
        created_at: new Date(),
        updated_at: new Date(),
      }
    ];

    it('should list tags with pagination', async () => {
      const page = 1;
      const pageSize = 10;
      const total = 2;

      (prisma.tag.findMany as jest.Mock).mockResolvedValue(mockTags);
      (prisma.tag.count as jest.Mock).mockResolvedValue(total);

      const result = await tagService.listTags({ page, pageSize });

      expect(prisma.tag.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          _count: {
            select: { posts: true }
          }
        },
        skip: 0,
        take: pageSize,
        orderBy: { name: 'asc' }
      });

      expect(result).toEqual({
        data: mockTags.map(tag => ({
          ...tag,
          postsCount: tag._count.posts
        })),
        pagination: {
          page,
          pageSize,
          total
        }
      });
    });

    it('should list tags with search', async () => {
      const search = 'tech';
      const page = 1;
      const pageSize = 10;
      const total = 1;
      const filteredTags = [mockTags[0]];

      (prisma.tag.findMany as jest.Mock).mockResolvedValue(filteredTags);
      (prisma.tag.count as jest.Mock).mockResolvedValue(total);

      const result = await tagService.listTags({ page, pageSize, search });

      expect(prisma.tag.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        include: {
          _count: {
            select: { posts: true }
          }
        },
        skip: 0,
        take: pageSize,
        orderBy: { name: 'asc' }
      });

      expect(result).toEqual({
        data: filteredTags.map(tag => ({
          ...tag,
          postsCount: tag._count.posts
        })),
        pagination: {
          page,
          pageSize,
          total
        }
      });
    });
  });

  describe('createTag', () => {
    const createTagDto = {
      name: 'New Tag',
      description: 'A new tag description'
    };

    it('should create a tag', async () => {
      const mockTag = {
        id: 1,
        ...createTagDto,
        _count: { posts: 0 },
        created_at: new Date(),
        updated_at: new Date(),
      };

      (prisma.tag.create as jest.Mock).mockResolvedValue(mockTag);

      const result = await tagService.createTag(createTagDto, userId);

      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: createTagDto,
        include: {
          _count: {
            select: { posts: true }
          }
        }
      });

      expect(auditService.log).toHaveBeenCalledWith(userId, 'CREATE', EntityType.Tag, mockTag.id);

      expect(result).toEqual({
        ...mockTag,
        postsCount: mockTag._count.posts
      });
    });
  });

  describe('updateTag', () => {
    const tagId = 1;
    const updateTagDto = {
      name: 'Updated Tag',
      description: 'Updated description'
    };

    it('should update a tag', async () => {
      const mockTag = {
        id: tagId,
        name: 'Old Tag',
        description: 'Old description',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockUpdatedTag = {
        ...mockTag,
        ...updateTagDto,
        _count: { posts: 2 },
        updated_at: expect.any(Date)
      };

      (prisma.tag.findUnique as jest.Mock).mockResolvedValue(mockTag);
      (prisma.tag.update as jest.Mock).mockResolvedValue(mockUpdatedTag);

      const result = await tagService.updateTag(tagId, updateTagDto, userId);

      expect(prisma.tag.update).toHaveBeenCalledWith({
        where: { id: tagId },
        data: {
          ...updateTagDto,
          updated_at: expect.any(Date)
        },
        include: {
          _count: {
            select: { posts: true }
          }
        }
      });

      expect(auditService.log).toHaveBeenCalledWith(userId, 'UPDATE', EntityType.Tag, tagId);

      expect(result).toEqual({
        ...mockUpdatedTag,
        postsCount: mockUpdatedTag._count.posts
      });
    });

    it('should throw NotFoundError if tag does not exist', async () => {
      (prisma.tag.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(tagService.updateTag(tagId, updateTagDto, userId))
        .rejects.toThrow('Tag not found');

      expect(prisma.tag.update).not.toHaveBeenCalled();
      expect(auditService.log).not.toHaveBeenCalled();
    });
  });

  describe('deleteTag', () => {
    const tagId = 1;

    it('should delete a tag', async () => {
      const mockTag = {
        id: tagId,
        name: 'Tag to Delete',
        description: 'Will be deleted',
        created_at: new Date(),
        updated_at: new Date(),
      };

      (prisma.tag.findUnique as jest.Mock).mockResolvedValue(mockTag);

      await tagService.deleteTag(tagId, userId);

      expect(prisma.tag.delete).toHaveBeenCalledWith({
        where: { id: tagId }
      });

      expect(auditService.log).toHaveBeenCalledWith(userId, 'DELETE', EntityType.Tag, tagId);
    });

    it('should throw NotFoundError if tag does not exist', async () => {
      (prisma.tag.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(tagService.deleteTag(tagId, userId))
        .rejects.toThrow('Tag not found');

      expect(prisma.tag.delete).not.toHaveBeenCalled();
      expect(auditService.log).not.toHaveBeenCalled();
    });
  });
});
