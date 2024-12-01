import { Request, Response } from 'express';
import { commentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

export const commentController = {
  async getCommentsByPostId(req: Request, res: Response) {
    const postId = parseInt(req.params.postId);
    const comments = await commentService.getCommentsByPostId(postId);
    res.json(comments);
  },

  async getCommentById(req: Request, res: Response) {
    const commentId = parseInt(req.params.commentId);
    const comment = await commentService.getComment(commentId);
    res.json(comment);
  },

  async createComment(req: Request, res: Response) {
    const data = plainToClass(CreateCommentDto, req.body);
    const errors = await validate(data);
    
    if (errors.length > 0) {
      return res.status(400).json({ errors: errors.map(error => Object.values(error.constraints)) });
    }

    const comment = await commentService.createComment(req.user.id, data);
    res.status(201).json(comment);
  },

  async deleteComment(req: Request, res: Response) {
    const commentId = parseInt(req.params.commentId);
    await commentService.deleteComment(commentId, req.user.id);
    res.status(204).send();
  },

  async updateComment(req: Request, res: Response) {
    const commentId = parseInt(req.params.commentId);
    const data = plainToClass(UpdateCommentDto, req.body);
    const errors = await validate(data);
    
    if (errors.length > 0) {
      return res.status(400).json({ errors: errors.map(error => Object.values(error.constraints)) });
    }

    const comment = await commentService.updateComment(commentId, req.user.id, data);
    res.json(comment);
  }
};
