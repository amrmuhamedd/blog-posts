import { IsString, IsOptional, IsNumber, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1, { message: 'Comment content cannot be empty' })
  content: string;

  @IsNumber()
  post_id: number;

  @IsOptional()
  @IsNumber()
  parent_id?: number;
}

export class UpdateCommentDto {
  @IsString()
  @MinLength(1, { message: 'Comment content cannot be empty' })
  content: string;
}
