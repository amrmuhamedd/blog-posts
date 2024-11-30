declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        email: string;
        role: 'USER' | 'ADMIN';
      };
    }
  }
}

export {}; // This file needs to be a module
