import { UploadedImage } from "@application/interfaces/types/UploadedImage";
import ACTOR from "@domain/interfaces/ACTOR";

export {};

declare global {
  namespace Express {
    export interface Request {
      user?: { id: number; name: string; email: string };
    }
  }
}
