import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { queryController } from "../controllers/query.controller.js";
import { rateLimitMiddleware } from "../middlewares/rateLimitMiddleware.js";

const router = express.Router();

router.post("/:id/query", authMiddleware,rateLimitMiddleware, queryController);

export default router;