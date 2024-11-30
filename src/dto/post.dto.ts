import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDate } from 'class-validator';
import { PostStatus } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @IsDate()
  @IsOptional()
  publish_at?: Date;

  @IsOptional()
  @IsString()
  image?: string;
}

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @IsDate()
  @IsOptional()
  publish_at?: Date;

  @IsOptional()
  @IsString()
  image?: string;
}
