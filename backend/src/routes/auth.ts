import { Router } from "express";
import { register, login, logout, me, getSession } from "../controllers/authController";
import requireAuth from "../middleware/requireAuth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);
router.get("/session", me)

export default router;