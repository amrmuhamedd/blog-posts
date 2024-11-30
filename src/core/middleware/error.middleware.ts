import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { BaseError } from '../errors/base.error';

export const errorMiddleware: ErrorRequestHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof BaseError) {
    res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      code: error.errorCode
    });
    return;
  }

  console.error('Unhandled error:', error);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};
