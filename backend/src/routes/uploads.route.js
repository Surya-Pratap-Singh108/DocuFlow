import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadController } from '../controllers/upload.controller.js';
const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { 
        fileSize: 15 * 1024 * 1024, // Limit file size to 15MB
    },
});

router.post('/upload', authMiddleware, upload.single('file'),uploadController );
export default router;