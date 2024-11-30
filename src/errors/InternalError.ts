import BaseError from "./baseError";

export default class InternalError extends BaseError {
  name = "InternalError";
  message: string;
  constructor(message = "Internal error") {
    super(message);
    this.message = message;
  }
}
