import { Request, Response } from 'express';
import { postService } from './post.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationError } from '../../core/errors/validation.error';

export class PostController {
  private static instance: PostController;

  private constructor() {}

  public static getInstance(): PostController {
    if (!PostController.instance) {
      PostController.instance = new PostController();
    }
    return PostController.instance;
  }

  async listPosts(req: Request, res: Response) {
    const { page = 1, pageSize = 10, status, tag } = req.query;
    const result = await postService.listPosts({
      page: Number(page),
      pageSize: Number(pageSize),
      status: status as any,
      tag: tag ? Number(tag) : undefined
    });
    return res.status(200).json(result);
  }

  async createPost(req: Request, res: Response) {
    const postDto = plainToClass(CreatePostDto, req.body);
    const errors = await validate(postDto);
    
    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    const result = await postService.createPost(req.user!.id, postDto);
    return res.status(201).json(result);
  }

  async updatePost(req: Request, res: Response) {
    const postDto = plainToClass(UpdatePostDto, req.body);
    const errors = await validate(postDto);
    
    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    const result = await postService.updatePost(
      Number(req.params.postId),
      req.user!.id,
      postDto
    );
    return res.status(200).json(result);
  }

  async deletePost(req: Request, res: Response) {
    await postService.deletePost(Number(req.params.postId), req.user!.id);
    return res.status(204).send();
  }
}

export const postController = PostController.getInstance();
