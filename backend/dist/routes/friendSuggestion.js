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
const similarity_1 = require("../utils/similarity");
const router = (0, express_1.Router)();
router.get("/friends/suggestions", requireAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const username = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.username;
    if (!username) {
        res.status(401).json({ error: "user not found" });
        return;
    }
    try {
        const currUser = yield prisma_1.default.user.findUnique({
            where: { username },
            include: { saved: true, liked: true },
        });
        if (!currUser) {
            res.status(404).json({ error: "user not found" });
            return;
        }
        const otherUsers = yield prisma_1.default.user.findMany({
            where: { id: { not: currUser.id } },
            include: { saved: true, liked: true },
        });
        const topUsers = (0, similarity_1.top5Users)(currUser, otherUsers);
        const suggestions = topUsers.map(({ user, finalScore, recipeScore, ingredientScore }) => ({
            id: user.id,
            username: user.username,
            similarity: parseFloat(finalScore.toFixed(2)),
            recipeScore: parseFloat(recipeScore.toFixed(2)),
            ingredientScore: parseFloat(ingredientScore.toFixed(2)),
        }));
        res.json(suggestions);
    }
    catch (err) {
        console.error("error generating friend suggestions: ", err);
        res.status(500).json({ error: "internal server error" });
    }
}));
exports.default = router;
