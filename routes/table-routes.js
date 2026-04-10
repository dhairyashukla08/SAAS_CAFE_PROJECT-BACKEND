import express from "express";
import {getAllTables,addTable,deleteTable,verifyTable} from "../controllers/table-controller.js"
const router=express.Router();

router.get("/",getAllTables);

router.post("/",addTable);

router.post("/verify", verifyTable);

router.delete("/:id",deleteTable);

export default router;