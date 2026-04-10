import express from "express";

import { getAllCafes, toggleCafeStatus } from "../controllers/superadmin-controller.js";

const router=express.Router();

router.get("/cafes", getAllCafes);

router.patch("/cafes/:id/toggle", toggleCafeStatus);

export default router;