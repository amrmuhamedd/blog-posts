import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateTagDto:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: The name of the tag
 *         description:
 *           type: string
 *           maxLength: 200
 *           description: Optional description of the tag
 */
export class CreateTagDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateTagDto:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: The name of the tag
 *         description:
 *           type: string
 *           maxLength: 200
 *           description: Optional description of the tag
 */
export class UpdateTagDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;
}
