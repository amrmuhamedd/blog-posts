import { IsEnum, IsInt } from 'class-validator';
import { EntityType, ReactionType } from '@prisma/client';

export class CreateReactionDto {
  @IsEnum(EntityType)
  entity_type: EntityType;

  @IsInt()
  entity_id: number;

  @IsEnum(ReactionType)
  reaction: ReactionType;
}
