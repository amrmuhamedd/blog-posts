import { PrismaClient, Media, MediaType, EntityType } from '@prisma/client';
import { NotFoundError } from '../../core/errors/not-found.error'; 
import { CreateMediaDto, UpdateMediaDto, MediaQueryDto, BulkCreateMediaDto, MediaResponseDto } from './media.dto';
import { auditService } from '../../core/services/audit.service';

const prisma = new PrismaClient();

export class MediaService {
  async create(data: CreateMediaDto, userId: number): Promise<MediaResponseDto> {
    const media = await prisma.media.create({
      data: {
        postId: data.postId,
        file_url: data.fileUrl,
        type: data.type,
      },
    });

    await auditService.log(userId, 'CREATE', EntityType.Media, media.id);
    return this.toMediaResponse(media);
  }

  async bulkCreate(data: BulkCreateMediaDto, userId: number): Promise<MediaResponseDto[]> {
    const mediaItems = await prisma.$transaction(
      data.media.map(item => 
        prisma.media.create({
          data: {
            postId: data.postId,
            file_url: item.fileUrl,
            type: item.type,
          },
        })
      )
    );

    await Promise.all(
      mediaItems.map(media => 
        auditService.log(userId, 'CREATE', EntityType.Media, media.id)
      )
    );

    return mediaItems.map(this.toMediaResponse);
  }

  async findByPostId(postId: number): Promise<MediaResponseDto[]> {
    const media = await prisma.media.findMany({
      where: { postId },
    });

    return media.map(this.toMediaResponse);
  }

  async findById(id: number, userId: number): Promise<MediaResponseDto> {
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundError('Media not found');
    }

    await auditService.log(userId, 'READ', EntityType.Media, media.id);
    return this.toMediaResponse(media);
  }

  async update(id: number, data: UpdateMediaDto, userId: number): Promise<MediaResponseDto> {
    const media = await prisma.media.update({
      where: { id },
      data: {
        file_url: data.fileUrl,
        type: data.type,
      },
    });

    await auditService.log(userId, 'UPDATE', EntityType.Media, media.id);
    return this.toMediaResponse(media);
  }

  async delete(id: number, userId: number): Promise<void> {
    await prisma.media.delete({
      where: { id },
    });

    await auditService.log(userId, 'DELETE', EntityType.Media, id);
  }

  async deleteByPostId(postId: number, userId: number): Promise<void> {
    await prisma.media.deleteMany({
      where: { postId },
    });

    await auditService.log(userId, 'DELETE_MANY', EntityType.Media, postId);
  }

  async findMany(query: MediaQueryDto, userId: number): Promise<{ data: MediaResponseDto[]; total: number }> {
    const take = query.limit || 10;
    const skip = ((query.page || 1) - 1) * take;

    const [media, total] = await prisma.$transaction([
      prisma.media.findMany({
        where: {
          postId: query.postId,
          type: query.type,
        },
        take,
        skip,
      }),
      prisma.media.count({
        where: {
          postId: query.postId,
          type: query.type,
        },
      }),
    ]);

    await Promise.all(
      media.map(item => 
        auditService.log(userId, 'READ', EntityType.Media, item.id)
      )
    );

    return {
      data: media.map(this.toMediaResponse),
      total,
    };
  }

  private toMediaResponse(media: Media): MediaResponseDto {
    return {
      id: media.id,
      postId: media.postId,
      fileUrl: media.file_url,
      type: media.type,
    };
  }
}
