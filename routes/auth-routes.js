import express from "express";

const router = express.Router();

import { register, login } from "../controllers/auth-controller.js";

import { protect,authorize } from "../middlewares/auth-middleware.js";

import {
  registerValidation,
  loginValidation,
  validate,
} from "../middlewares/validators.js";

router.post("/register", registerValidation, validate, register);

router.post("/login", loginValidation, validate, login);

export default router;
