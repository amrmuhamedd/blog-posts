import { prisma } from '../../core/database/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { NotFoundError } from '../../core/errors/not-found.error';
import { PaginationParams } from '../../core/interfaces/pagination.interface';
import { ConflictError } from '../../core/errors/conflict.error';
import { EntityType } from '@prisma/client';
import { auditService } from '../../core/services/audit.service';

export class CategoryService {
  private static instance: CategoryService;
  private constructor() {}

  public static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

  async listCategories(params: PaginationParams & { search?: string }) {
    const { page = 1, pageSize = 10, search } = params;
    const skip = (Number(page) - 1) * Number(pageSize);

    const where = search ? {
      name: {
        contains: search,
        mode: 'insensitive' as const
      }
    } : {};

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          _count: {
            select: { posts: true }
          }
        },
        skip,
        take: Number(pageSize),
        orderBy: { name: 'asc' }
      }),
      prisma.category.count({ where })
    ]);

    return {
      data: categories.map(category => ({
        ...category,
        postsCount: category._count.posts
      })),
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total
      }
    };
  }

  async createCategory(data: CreateCategoryDto, userId: number) {
    try {
      const existing = await prisma.category.findFirst({
        where: {
          name: {
            equals: data.name,
            mode: 'insensitive'
          }
        }
      });

      if (existing) {
        throw new ConflictError('Category with this name already exists');
      }

      const category = await prisma.category.create({
        data: {
          name: data.name
        }
      });

      await auditService.log(userId, 'CREATE', EntityType.Category, category.id);

      return category;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictError('Category name already exists');
      }
      throw error;
    }
  }

  async updateCategory(id: number, data: UpdateCategoryDto, userId: number) {
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    try {
      if (data.name) {
        const existing = await prisma.category.findFirst({
          where: {
            id: { not: id },
            name: {
              equals: data.name,
              mode: 'insensitive'
            }
          }
        });

        if (existing) {
          throw new ConflictError('Category with this name already exists');
        }
      }

      const updatedCategory = await prisma.category.update({
        where: { id },
        data: {
          name: data.name,
          updated_at: new Date()
        }
      });

      await auditService.log(userId, 'UPDATE', EntityType.Category, id);

      return updatedCategory;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictError('Category name already exists');
      }
      throw error;
    }
  }

  async deleteCategory(id: number, userId: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    await prisma.category.delete({
      where: { id }
    });

    await auditService.log(userId, 'DELETE', EntityType.Category, id);
  }

  async getCategory(id: number, userId?: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (userId) {
      await auditService.log(userId, 'READ', EntityType.Category, category.id);
    }

    return {
      ...category,
      postsCount: category._count.posts
    };
  }
}

export const categoryService = CategoryService.getInstance();
