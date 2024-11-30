import { prisma } from '../../core/database/prisma.service';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';
import { NotFoundError } from '../../core/errors/not-found.error';
import { PaginationParams } from '../../core/interfaces/pagination.interface';

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

  async createTag(createTagDto: CreateTagDto) {
    return prisma.tag.create({
      data: {
        name: createTagDto.name,
        description: createTagDto.description
      }
    });
  }

  async updateTag(id: number, updateTagDto: UpdateTagDto) {
    const tag = await prisma.tag.findUnique({
      where: { id }
    });

    if (!tag) {
      throw new NotFoundError('Tag not found');
    }

    return prisma.tag.update({
      where: { id },
      data: {
        name: updateTagDto.name,
        description: updateTagDto.description,
        updated_at: new Date()
      }
    });
  }

  async deleteTag(id: number) {
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!tag) {
      throw new NotFoundError('Tag not found');
    }

    await prisma.tag.delete({
      where: { id }
    });
  }
}

export const tagService = TagService.getInstance();
