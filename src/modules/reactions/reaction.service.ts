import { prisma } from '../../prisma';
import { CreateReactionDto } from './dto/reaction.dto';
import { EntityType, ReactionType } from '@prisma/client';

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
        return null;
      } else {
        // If different reaction exists, update it
        return prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { reaction: data.reaction },
        });
      }
    }

    // If no reaction exists, create new one
    return prisma.reaction.create({
      data: {
        user_id: userId,
        ...data,
      },
    });
  }

  async getReactions(entityType: EntityType, entityId: number) {
    const reactions = await prisma.reaction.groupBy({
      by: ['reaction'],
      where: {
        entity_type: entityType,
        entity_id: entityId,
      },
      _count: true,
    });

    return Object.fromEntries(
      reactions.map((r) => [r.reaction, r._count])
    );
  }

  async getUserReaction(userId: number, entityType: EntityType, entityId: number) {
    return prisma.reaction.findUnique({
      where: {
        user_id_entity_type_entity_id: {
          user_id: userId,
          entity_type: entityType,
          entity_id: entityId,
        },
      },
    });
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
      return null;
    }

    // If no like exists, create new one
    return prisma.reaction.create({
      data: {
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
        reaction: ReactionType.Like,
      },
    });
  }

  async getLikes(entityType: EntityType, entityId: number) {
    const likes = await prisma.reaction.count({
      where: {
        entity_type: entityType,
        entity_id: entityId,
        reaction: ReactionType.Like,
      },
    });

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

    return reaction?.reaction === ReactionType.Like;
  }
}

export const reactionService = new ReactionService();
