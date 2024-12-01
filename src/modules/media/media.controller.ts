import { Request, Response } from 'express';
import { MediaService } from './media.service';
import { MediaType } from '@prisma/client';
import { CreateMediaDto, UpdateMediaDto, BulkCreateMediaDto, MediaQueryDto } from './media.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationError } from '../../core/errors/validation.error';
import { AuthenticatedRequest } from '../../core/interfaces/auth.interface';

const mediaService = new MediaService();

export class MediaController {
  async create(req: AuthenticatedRequest, res: Response) {
    const createDto = plainToClass(CreateMediaDto, {
      postId: parseInt(req.body.postId),
      fileUrl: req.body.fileUrl,
      type: req.body.type as MediaType,
    });
    
    const errors = await validate(createDto);
    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    const media = await mediaService.create(createDto, req.user.id);
    res.status(201).json(media);
  }

  async update(req: AuthenticatedRequest, res: Response) {
    const updateDto = plainToClass(UpdateMediaDto, {
      fileUrl: req.body.fileUrl,
      type: req.body.type as MediaType,
    });
    
    const errors = await validate(updateDto);
    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    const id = parseInt(req.params.id);
    const media = await mediaService.update(id, updateDto, req.user.id);
    res.json(media);
  }

  async bulkCreate(req: AuthenticatedRequest, res: Response) {
    const bulkCreateDto = plainToClass(BulkCreateMediaDto, {
      postId: parseInt(req.body.postId),
      media: req.body.media.map((item: any) => ({
        fileUrl: item.fileUrl,
        type: item.type as MediaType,
      })),
    });
    
    const errors = await validate(bulkCreateDto);
    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    const media = await mediaService.bulkCreate(bulkCreateDto, req.user.id);
    res.status(201).json(media);
  }

  async delete(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);
    await mediaService.delete(id, req.user.id);
    res.status(204).send();
  }

  async getById(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);
    const media = await mediaService.findById(id, req.user.id);
    res.json(media);
  }

  async getByPostId(req: AuthenticatedRequest, res: Response) {
    const postId = parseInt(req.params.postId);
    const media = await mediaService.findByPostId(postId);
    res.json(media);
  }

  async list(req: AuthenticatedRequest, res: Response) {
    const query = plainToClass(MediaQueryDto, {
      postId: req.query.postId ? parseInt(req.query.postId as string) : undefined,
      type: req.query.type as MediaType | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    });

    const errors = await validate(query);
    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    const result = await mediaService.findMany(query, req.user.id);
    res.json(result);
  }
}
