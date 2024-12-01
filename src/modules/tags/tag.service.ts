import { prisma } from '../../core/database/prisma.service';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';
import { NotFoundError } from '../../core/errors/not-found.error';
import { PaginationParams } from '../../core/interfaces/pagination.interface';
import { EntityType } from '@prisma/client';
import { auditService } from '../../core/services/audit.service';

export class TagService {
  private static instance: TagService;

  private constructor() {}

  public static getInstance(): TagService {
    if (!TagService.instance) {
      TagService.instance = new TagService();
    }
    return TagService.instance;
  }

  async listTags(params: PaginationParams & { search?: string }) {
    const { page = 1, pageSize = 10, search } = params;
    const skip = (Number(page) - 1) * Number(pageSize);

    const where = search ? {
      name: {
        contains: search,
        mode: 'insensitive' as const
      }
    } : {};

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
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
      prisma.tag.count({ where })
    ]);

    return {
      data: tags.map(tag => ({
        ...tag,
        postsCount: tag._count.posts
      })),
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total
      }
    };
  }

  async createTag(createTagDto: CreateTagDto, userId: number) {
    const tag = await prisma.tag.create({
      data: {
        name: createTagDto.name,
        description: createTagDto.description
      },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    await auditService.log(userId, 'CREATE', EntityType.Tag, tag.id);

    return {
      ...tag,
      postsCount: tag._count.posts
    };
  }

  async updateTag(id: number, updateTagDto: UpdateTagDto, userId: number) {
    const tag = await prisma.tag.findUnique({
      where: { id }
    });

    if (!tag) {
      throw new NotFoundError('Tag not found');
    }

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: {
        name: updateTagDto.name,
        description: updateTagDto.description,
        updated_at: new Date()
      },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    await auditService.log(userId, 'UPDATE', EntityType.Tag, id);

    return {
      ...updatedTag,
      postsCount: updatedTag._count.posts
    };
  }

  async deleteTag(id: number, userId: number) {
    const tag = await prisma.tag.findUnique({
      where: { id }
    });

    if (!tag) {
      throw new NotFoundError('Tag not found');
    }

    await prisma.tag.delete({
      where: { id }
    });

    await auditService.log(userId, 'DELETE', EntityType.Tag, id);
  }
}

export const tagService = TagService.getInstance();
