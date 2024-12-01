import { prisma } from '../../prisma';
import { CreateReactionDto } from './dto/reaction.dto';
import { EntityType, ReactionType } from '@prisma/client';
import { auditService } from '../../core/services/audit.service';

class ReactionService {
  async toggleReaction(userId: number, data: CreateReactionDto) {
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        user_id_entity_type_entity_id: {
          user_id: userId,
          entity_type: data.entity_type,
          entity_id: data.entity_id,
        },
      },
    });

    if (existingReaction) {
      if (existingReaction.reaction === data.reaction) {
        // If same reaction exists, remove it (toggle off)
        await prisma.reaction.delete({
          where: { id: existingReaction.id },
        });
        await auditService.log(userId, 'DELETE', EntityType.Reaction, existingReaction.id);
        return null;
      } else {
        // If different reaction exists, update it
        const updatedReaction = await prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { reaction: data.reaction },
        });
        await auditService.log(userId, 'UPDATE', EntityType.Reaction, existingReaction.id);
        return updatedReaction;
      }
    }

    // If no reaction exists, create new one
    const newReaction = await prisma.reaction.create({
      data: {
        user_id: userId,
        ...data,
      },
    });
    await auditService.log(userId, 'CREATE', EntityType.Reaction, newReaction.id);
    return newReaction;
  }

  async getReactions(entityType: EntityType, entityId: number, userId?: number) {
    const reactions = await prisma.reaction.groupBy({
      by: ['reaction'],
      where: {
        entity_type: entityType,
        entity_id: entityId,
      },
      _count: true,
    });

    if (userId) {
      await auditService.log(userId, 'READ', EntityType.Reaction, entityId);
    }

    return reactions.reduce((acc, curr) => {
      acc[curr.reaction] = curr._count;
      return acc;
    }, {} as Record<ReactionType, number>);
  }

  async getUserReaction(userId: number, entityType: EntityType, entityId: number) {
    const reaction = await prisma.reaction.findUnique({
      where: {
        user_id_entity_type_entity_id: {
          user_id: userId,
          entity_type: entityType,
          entity_id: entityId,
        },
      },
    });
    await auditService.log(userId, 'READ', EntityType.Reaction, entityId);
    return reaction;
  }

  async toggleLike(userId: number, entityType: EntityType, entityId: number) {
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        user_id_entity_type_entity_id: {
          user_id: userId,
          entity_type: entityType,
          entity_id: entityId,
        },
      },
    });

    if (existingReaction) {
      // If like exists, remove it (toggle off)
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      });
      await auditService.log(userId, 'DELETE', EntityType.Reaction, existingReaction.id);
      return null;
    }

    // If no like exists, create new one
    const newReaction = await prisma.reaction.create({
      data: {
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
        reaction: ReactionType.Like,
      },
    });
    await auditService.log(userId, 'CREATE', EntityType.Reaction, newReaction.id);
    return newReaction;
  }

  async getLikes(entityType: EntityType, entityId: number, userId?: number) {
    const likes = await prisma.reaction.count({
      where: {
        entity_type: entityType,
        entity_id: entityId,
        reaction: ReactionType.Like,
      },
    });

    if (userId) {
      await auditService.log(userId, 'READ', EntityType.Reaction, entityId);
    }

    return { likes };
  }

  async hasUserLiked(userId: number, entityType: EntityType, entityId: number) {
    const reaction = await prisma.reaction.findUnique({
      where: {
        user_id_entity_type_entity_id: {
          user_id: userId,
          entity_type: entityType,
          entity_id: entityId,
        },
      },
    });
    await auditService.log(userId, 'READ', EntityType.Reaction, entityId);
    return reaction?.reaction === ReactionType.Like;
  }
}

export const reactionService = new ReactionService();
