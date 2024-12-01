import { Request, Response } from 'express';
import { reactionService } from './reaction.service';
import { CreateReactionDto } from './dto/reaction.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { EntityType } from '@prisma/client';

export const reactionController = {
  async toggleReaction(req: Request, res: Response) {
    const data = plainToClass(CreateReactionDto, req.body);
    const errors = await validate(data);
    
    if (errors.length > 0) {
      return res.status(400).json({ errors: errors.map(error => Object.values(error.constraints)) });
    }

    const reaction = await reactionService.toggleReaction(req.user.id, data);
    res.json(reaction);
  },

  async getReactions(req: Request, res: Response) {
    const entityType = req.params.entityType as EntityType;
    const entityId = parseInt(req.params.entityId);

    if (!Object.values(EntityType).includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }

    const reactions = await reactionService.getReactions(entityType, entityId);
    const userReaction = req.user?.id 
      ? await reactionService.getUserReaction(req.user.id, entityType, entityId)
      : null;

    res.json({
      reactions,
      userReaction: userReaction?.reaction || null,
    });
  },
};
