import IError from "./IError";

export default class BaseError extends Error implements IError {
  name = "BaseError";
  message: string;

  constructor(message = "") {
    super(message);
    this.message = message;
  }
}
