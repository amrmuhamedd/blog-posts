import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
// eslint-disable-next-line
const { body } = require("express-validator");

export const registrationDto = [
  body("name").notEmpty().withMessage("you must have a name"),
  body("email").isEmail().withMessage("Not a valid e-mail address"),
  body("password").isLength({ min: 6 }),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];
