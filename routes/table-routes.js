import express from "express";
import {getAllTables,addTable,deleteTable,verifyTable} from "../controllers/table-controller.js"
import { protect } from "../middlewares/auth-middleware.js";
const router=express.Router();

router.get("/", protect, getAllTables);

router.post("/", protect, addTable);

router.delete("/:id", protect, deleteTable);

router.post("/verify", verifyTable);

export default router;