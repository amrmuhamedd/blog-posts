import { Request, Response } from 'express';
import { userService } from './user.service';
import { CreateUserDto, LoginDto } from './dto/user.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationError } from '../../core/errors/validation.error';

export class UserController {
  private static instance: UserController;

  private constructor() {}

  public static getInstance(): UserController {
    if (!UserController.instance) {
      UserController.instance = new UserController();
    }
    return UserController.instance;
  }

  async register(req: Request, res: Response) {
    const userDto = plainToClass(CreateUserDto, req.body);
    const errors = await validate(userDto);
    
    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    const result = await userService.register(userDto, req.file);
    return res.status(201).json(result);
  }

  async login(req: Request, res: Response) {
    const loginDto = plainToClass(LoginDto, req.body);
    const errors = await validate(loginDto);
    
    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    const result = await userService.login(loginDto);
    return res.status(200).json(result);
  }
}

export const userController = UserController.getInstance();
