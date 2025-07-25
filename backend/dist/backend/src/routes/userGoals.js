"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const router = (0, express_1.Router)();
router.get("/user/goals", requireAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const username = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.username;
    const user = yield prisma_1.default.user.findUnique({ where: { username } });
    if (!user) {
        res.status(401).json({ error: "user not found" });
        return;
    }
    res.json({
        calories: (_b = user.goalCalories) !== null && _b !== void 0 ? _b : 0,
        protein: (_c = user.goalProtein) !== null && _c !== void 0 ? _c : 0,
        carbs: (_d = user.goalCarbs) !== null && _d !== void 0 ? _d : 0,
    });
}));
router.post("/user/goals", requireAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const username = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.username;
    const { calories, protein, carbs } = req.body;
    const user = yield prisma_1.default.user.update({
        where: { username },
        data: {
            goalCalories: calories,
            goalProtein: protein,
            goalCarbs: carbs,
        },
    });
    res.json({
        message: "goals saved",
        calories: user.goalCalories,
        protein: user.goalProtein,
        carbs: user.goalCarbs,
    });
}));
exports.default = router;
