import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { conversationController } from "../controllers/conversation.controller.js";

const router = express.Router();

router.get("/:id/conversations", authMiddleware, conversationController);

export default router;