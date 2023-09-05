const { body } = require("express-validator");

export const registrationDto = [
  body("name").notEmpty().withMessage("you must have a name"),
  body("email").isEmail().withMessage("Not a valid e-mail address"),
  body("password").isLength({ min: 6 }),
];
