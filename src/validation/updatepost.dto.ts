import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";

const { body } = require("express-validator");

export const updatePostDto = [
  body("title").isString().optional(),
  body("content").isString().optional(),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];
