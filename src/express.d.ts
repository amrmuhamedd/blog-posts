import { Roles } from "./core/enums/roles";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        email: string;
        role: Roles;
      };
    }
  }
}

export {}; // This file needs to be a module
