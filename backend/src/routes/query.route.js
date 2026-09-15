import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { queryController } from "../controllers/query.controller.js";

const router = express.Router();

router.post("/:id/query", authMiddleware, queryController);

export default router;