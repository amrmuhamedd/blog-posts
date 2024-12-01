import { CategoryService } from '../category.service';
import { prisma } from '../../../core/database/prisma.service';
import { auditService } from '../../../core/services/audit.service';
import { ConflictError } from '../../../core/errors/conflict.error';
import { NotFoundError } from '../../../core/errors/not-found.error';
import { EntityType } from '@prisma/client';

// Mock dependencies
jest.mock('../../../core/database/prisma.service', () => ({
  prisma: {
    category: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('../../../core/services/audit.service', () => ({
  auditService: {
    log: jest.fn(),
  },
}));

describe('CategoryService', () => {
  let categoryService: CategoryService;
  const userId = 1;

  beforeEach(() => {
    categoryService = CategoryService.getInstance();
    jest.clearAllMocks();
  });

  describe('listCategories', () => {
    const mockCategories = [
      { id: 1, name: 'Technology', _count: { posts: 5 } },
      { id: 2, name: 'Travel', _count: { posts: 3 } },
    ];

    it('should successfully list categories with pagination', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue(mockCategories);
      (prisma.category.count as jest.Mock).mockResolvedValue(2);

      const result = await categoryService.listCategories({ page: 1, pageSize: 10 });

      expect(prisma.category.findMany).toHaveBeenCalledWith(expect.objectContaining({
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' }
      }));
      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        pageSize: 10,
        total: 2
      });
    });

    it('should filter categories by search term', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([mockCategories[0]]);
      (prisma.category.count as jest.Mock).mockResolvedValue(1);

      await categoryService.listCategories({ search: 'Tech', page: 1, pageSize: 10 });

      expect(prisma.category.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          name: {
            contains: 'Tech',
            mode: 'insensitive'
          }
        }
      }));
    });
  });

  describe('createCategory', () => {
    const mockCreateDto = {
      name: 'Technology',
    };

    it('should successfully create a category', async () => {
      const mockCategory = { id: 1, ...mockCreateDto };
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.category.create as jest.Mock).mockResolvedValue(mockCategory);

      const result = await categoryService.createCategory(mockCreateDto, userId);

      expect(prisma.category.findFirst).toHaveBeenCalled();
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: mockCreateDto
      });
      expect(auditService.log).toHaveBeenCalledWith(userId, 'CREATE', EntityType.Category, 1);
      expect(result).toEqual(mockCategory);
    });

    it('should throw ConflictError if category name already exists', async () => {
      (prisma.category.findFirst as jest.Mock).mockResolvedValue({ id: 1, name: 'Technology' });

      await expect(categoryService.createCategory(mockCreateDto, userId))
        .rejects.toThrow('Category with this name already exists');
      expect(prisma.category.create).not.toHaveBeenCalled();
    });
  });

  describe('updateCategory', () => {
    const categoryId = 1;
    const mockUpdateDto = {
      name: 'Updated Technology',
    };

    it('should successfully update a category', async () => {
      const mockCategory = { id: categoryId, name: 'Technology' };
      const mockUpdatedCategory = { id: categoryId, ...mockUpdateDto };
      
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.category.update as jest.Mock).mockResolvedValue(mockUpdatedCategory);

      const result = await categoryService.updateCategory(categoryId, mockUpdateDto, userId);

      expect(prisma.category.findUnique).toHaveBeenCalledWith({ where: { id: categoryId } });
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: categoryId },
        data: expect.objectContaining(mockUpdateDto)
      });
      expect(auditService.log).toHaveBeenCalledWith(userId, 'UPDATE', EntityType.Category, categoryId);
      expect(result).toEqual(mockUpdatedCategory);
    });

    it('should throw NotFoundError if category does not exist', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(categoryService.updateCategory(categoryId, mockUpdateDto, userId))
        .rejects.toThrow('Category not found');
      expect(prisma.category.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError if new name already exists', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({ id: categoryId, name: 'Technology' });
      (prisma.category.findFirst as jest.Mock).mockResolvedValue({ id: 2, name: mockUpdateDto.name });

      await expect(categoryService.updateCategory(categoryId, mockUpdateDto, userId))
        .rejects.toThrow('Category with this name already exists');
      expect(prisma.category.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteCategory', () => {
    const categoryId = 1;

    it('should successfully delete a category', async () => {
      const mockCategory = { id: categoryId, name: 'Technology', _count: { posts: 0 } };
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.category.delete as jest.Mock).mockResolvedValue(mockCategory);

      await categoryService.deleteCategory(categoryId, userId);

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId },
        include: { _count: { select: { posts: true } } }
      });
      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: categoryId }
      });
      expect(auditService.log).toHaveBeenCalledWith(userId, 'DELETE', EntityType.Category, categoryId);
    });

    it('should throw NotFoundError if category does not exist', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(categoryService.deleteCategory(categoryId, userId))
        .rejects.toThrow('Category not found');
      expect(prisma.category.delete).not.toHaveBeenCalled();
    });
  });

  describe('getCategory', () => {
    const categoryId = 1;

    it('should successfully get a category', async () => {
      const mockCategory = { 
        id: categoryId, 
        name: 'Technology',
        _count: { posts: 5 }
      };
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory);

      const result = await categoryService.getCategory(categoryId, userId);

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId },
        include: { _count: { select: { posts: true } } }
      });
      expect(auditService.log).toHaveBeenCalledWith(userId, 'READ', EntityType.Category, categoryId);
      expect(result).toEqual({
        ...mockCategory,
        postsCount: mockCategory._count.posts
      });
    });

    it('should throw NotFoundError if category does not exist', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(categoryService.getCategory(categoryId))
        .rejects.toThrow('Category not found');
    });

    it('should not log audit when userId is not provided', async () => {
      const mockCategory = { 
        id: categoryId, 
        name: 'Technology',
        _count: { posts: 5 }
      };
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory);

      await categoryService.getCategory(categoryId);

      expect(auditService.log).not.toHaveBeenCalled();
    });
  });
});
