import { Response } from "express";

export type BasResponse<T> = Promise<Response<T>>;
