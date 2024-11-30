import { prisma } from '../../core/database/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { NotFoundError } from '../../core/errors/not-found.error';
import { PaginationParams } from '../../core/interfaces/pagination.interface';
import { ConflictError } from '../../core/errors/conflict.error';

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

  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      return await prisma.category.create({
        data: {
          name: createCategoryDto.name
        }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictError('Category name already exists');
      }
      throw error;
    }
  }

  async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    try {
      return await prisma.category.update({
        where: { id },
        data: {
          name: updateCategoryDto.name,
          updated_at: new Date()
        }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictError('Category name already exists');
      }
      throw error;
    }
  }

  async deleteCategory(id: number) {
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
  }

  async getCategory(id: number) {
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

    return {
      ...category,
      postsCount: category._count.posts
    };
  }
}

export const categoryService = CategoryService.getInstance();
