import { BaseError } from './base.error';

export class BadRequestError extends BaseError {
  constructor(message: string = 'Bad Request') {
    super(message, 400, 'BAD_REQUEST');
  }
}
