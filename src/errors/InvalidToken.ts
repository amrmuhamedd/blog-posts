import BaseError from "./baseError";

export default class InvalidToken extends BaseError {
  type = "INVALID_TOKEN";
  name = "InvalidToken";
  constructor(message = "invalid token") {
    super(message);
  }
}
