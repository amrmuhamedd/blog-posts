import { MediaType } from '@prisma/client';
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export class CreateMediaDto {
  @IsNumber()
  postId: number;

  @IsString()
  fileUrl: string;

  @IsEnum(MediaType)
  type: MediaType;
}

export class MediaResponseDto {
  id: number;
  postId: number;
  fileUrl: string;
  type: MediaType;
}

export class UpdateMediaDto {
  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsEnum(MediaType)
  @IsOptional()
  type?: MediaType;
}

export class BulkCreateMediaDto {
  @IsNumber()
  postId: number;

  @IsString({ each: true })
  media: {
    fileUrl: string;
    type: MediaType;
  }[];
}

export class MediaQueryDto {
  @IsNumber()
  @IsOptional()
  postId?: number;

  @IsEnum(MediaType)
  @IsOptional()
  type?: MediaType;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}
