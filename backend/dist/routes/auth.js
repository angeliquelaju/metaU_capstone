"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const router = (0, express_1.Router)();
router.post("/register", authController_1.register);
router.post("/login", authController_1.login);
router.post("/logout", authController_1.logout);
router.get("/me", requireAuth_1.default, authController_1.me);
router.get("/session", authController_1.me);
exports.default = router;
