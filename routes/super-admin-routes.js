import express from "express";
const router=express.Router();
import { protect,isSuperAdmin } from "../middlewares/auth-middleware.js";
import { deleteCafe, getAllClients, onboardNewCafe, toggleSuspendCafe, updateCafe } from "../controllers/super-admin-controller.js";

router.get("/clients",protect,isSuperAdmin,getAllClients);

router.post("/onboard",protect,isSuperAdmin,onboardNewCafe);

router.put("/update/:id", protect, isSuperAdmin, updateCafe);

router.put("/suspend/:id", protect, isSuperAdmin, toggleSuspendCafe);

router.delete("/delete/:id", protect, isSuperAdmin, deleteCafe);

export default router;