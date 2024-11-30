import { BaseError } from './base.error';
import { ValidationError as ClassValidatorError } from 'class-validator';

export class ValidationError extends BaseError {
  constructor(message: string = 'Validation Error', public errors?: ClassValidatorError[]) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}
