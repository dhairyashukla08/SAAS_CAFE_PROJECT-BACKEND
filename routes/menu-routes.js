import express from "express";
import { addMenuItem, bulkAddMenuItems, deleteMenuItem, getMenuItems, updateMenuItem } from "../controllers/menu-controller.js";
import { protect } from "../middlewares/auth-middleware.js";

const router=express.Router();

router.get("/",getMenuItems);

router.post("/",protect, addMenuItem);

router.post("/bulk", protect, bulkAddMenuItems);

router.put("/:id", protect, updateMenuItem);

router.delete("/:id",protect,deleteMenuItem);

export default router;