import { check, validationResult } from "express-validator";

export const registerValidation = [
  check("name", "Name is required").not().isEmpty().trim(),
  check("email", "Please include a valid email").isEmail().normalizeEmail(),
  check("password", "Password must be 6 or more characters").isLength({
    min: 6,
  }),
];

export const loginValidation = [
  check("email", "Please include a valid email").isEmail().normalizeEmail(),
  check("password", "Password is required").exists(),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
