import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getDocumentsController } from "../controllers/getDocument.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getDocumentsController);

export default router;