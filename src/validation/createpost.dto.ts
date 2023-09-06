import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";

const { body } = require("express-validator");

export const createPostDto = [
  body("title").notEmpty().withMessage("you must enter a title for post"),
  body("content").notEmpty().withMessage("you must enter a content"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];
