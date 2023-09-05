const { body } = require("express-validator");

export const loginDto = [
  body("email").isEmail().withMessage("Not a valid e-mail address"),
  body("password").isLength({ min: 6 }),
];
