import { Request, Response } from 'express';
import { categoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationError } from '../../core/errors/validation.error';

export class CategoryController {
  private static instance: CategoryController;
  private constructor() {}

  public static getInstance(): CategoryController {
    if (!CategoryController.instance) {
      CategoryController.instance = new CategoryController();
    }
    return CategoryController.instance;
  }

  async listCategories(req: Request, res: Response) {
    const { page, pageSize, search } = req.query;
    const result = await categoryService.listCategories({
      page: Number(page),
      pageSize: Number(pageSize),
      search: search as string
    });
    return res.status(200).json(result);
  }

  async createCategory(req: Request, res: Response) {
    const categoryDto = plainToClass(CreateCategoryDto, req.body);
    const errors = await validate(categoryDto);
    
    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    const result = await categoryService.createCategory(categoryDto);
    return res.status(201).json(result);
  }

  async updateCategory(req: Request, res: Response) {
    const categoryDto = plainToClass(UpdateCategoryDto, req.body);
    const errors = await validate(categoryDto);
    
    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    const result = await categoryService.updateCategory(Number(req.params.id), categoryDto);
    return res.status(200).json(result);
  }

  async deleteCategory(req: Request, res: Response) {
    await categoryService.deleteCategory(Number(req.params.id));
    return res.status(204).send();
  }

  async getCategory(req: Request, res: Response) {
    const result = await categoryService.getCategory(Number(req.params.id));
    return res.status(200).json(result);
  }
}

export const categoryController = CategoryController.getInstance();
