import { IsString, IsOptional, IsEnum, IsArray, IsNumber, IsDate, MinLength, MaxLength } from 'class-validator';
import { PostStatus } from '@prisma/client';
import { Type } from 'class-transformer';

/**
 * @swagger
 * components:
 *   schemas:
 *     CreatePostDto:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - status
 *       properties:
 *         title:
 *           type: string
 *           minLength: 5
 *           maxLength: 100
 *         content:
 *           type: string
 *           minLength: 10
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *         publish_at:
 *           type: string
 *           format: date-time
 *         tags:
 *           type: array
 *           items:
 *             type: number
 */
export class CreatePostDto {
  @IsString()
  @MinLength(5, { message: 'Title must be at least 5 characters' })
  @MaxLength(100 , { message: 'Title must be between 5 and 100 characters' })
  title: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsEnum(PostStatus)
  status: PostStatus;

  @IsOptional()
  @IsDate()
  publish_at?: Date;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tags?: number[];
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdatePostDto:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 5
 *           maxLength: 100
 *         content:
 *           type: string
 *           minLength: 10
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *         publish_at:
 *           type: string
 *           format: date-time
 *         tags:
 *           type: array
 *           items:
 *             type: number
 */
export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  content?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  publish_at?: Date;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tags?: number[];
}
