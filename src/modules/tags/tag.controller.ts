import { Request, Response } from 'express';
import { tagService } from './tag.service';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationError } from '../../core/errors/validation.error';

export class TagController {
  private static instance: TagController;

  private constructor() {}

  public static getInstance(): TagController {
    if (!TagController.instance) {
      TagController.instance = new TagController();
    }
    return TagController.instance;
  }

  async listTags(req: Request, res: Response) {
    const { page, pageSize, search } = req.query;
    const result = await tagService.listTags({
      page: Number(page),
      pageSize: Number(pageSize),
      search: search as string
    });
    return res.status(200).json(result);
  }

  async createTag(req: Request, res: Response) {
    const tagDto = plainToClass(CreateTagDto, req.body);
    const errors = await validate(tagDto);
    
    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    const result = await tagService.createTag(tagDto,  req.user.id);
    return res.status(201).json(result);
  }

  async updateTag(req: Request, res: Response) {
    const tagDto = plainToClass(UpdateTagDto, req.body);
    const errors = await validate(tagDto);
    
    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    const result = await tagService.updateTag(Number(req.params.id), tagDto, Number(req.user.id));
    return res.status(200).json(result);
  }

  async deleteTag(req: Request, res: Response) {
    await tagService.deleteTag(Number(req.params.id), req.user.id);
    return res.status(204).send();
  }
}

export const tagController = TagController.getInstance();
