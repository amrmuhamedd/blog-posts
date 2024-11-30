import { UnauthorizedError } from "./unauthorized.error";

export class InvalidToken extends UnauthorizedError {
  constructor(message: string = "Invalid token") {
    super(message);
    this.name = "InvalidToken";
  }
}
