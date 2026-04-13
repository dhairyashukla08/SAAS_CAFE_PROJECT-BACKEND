import express from "express";
const router=express.Router();
import { protect,isSuperAdmin } from "../middlewares/auth-middleware.js";
import { getAllClients, onboardNewCafe } from "../controllers/super-admin-controller.js";

router.get("/clients",protect,isSuperAdmin,getAllClients);

router.post("/onboard",protect,isSuperAdmin,onboardNewCafe);

export default router;