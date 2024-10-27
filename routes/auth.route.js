import express from 'express';
import { login, signup, logout } from '../controllers/auth.controller.js';
import { checkToken } from '../middlewares/checkToken.js';
const router = express.Router();

router.post("/signup",signup)

router.post("/login",login)

router.post("/logout", checkToken, logout)

export default router;
