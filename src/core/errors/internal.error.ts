import { BaseError } from './base.error';

export default class InternalError extends BaseError {
  constructor(message: string = 'Internal Server Error') {
    super(message, 500, 'INTERNAL_ERROR');
  }
}
