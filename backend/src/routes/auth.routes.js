import express from 'express';
import { loginController, meController, getAccessTokenController, signupController, logoutController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/signup',signupController); 
router.post('/login', loginController);

router.get('/me', authMiddleware, meController);

router.post('/get-accessToken',  getAccessTokenController);

router.post('/logout', authMiddleware, logoutController);


export default router;