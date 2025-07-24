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
const recipeMap_1 = require("../utils/recipeMap");
const router = (0, express_1.Router)();
//calculates recipe similarity using weighted jaccard similarity
//weight: 1 (if saved), 2 (if liked), 3 (if saved and liked)
function recipeSimilar(mapA, mapB) {
    const allRecipeIds = new Set([...mapA.keys(), ...mapB.keys()]);
    let intersection = 0;
    let union = 0;
    for (const id of allRecipeIds) {
        const a = mapA.get(id) || 0;
        const b = mapB.get(id) || 0;
        intersection += Math.min(a, b); // both users saved recipes
        union += Math.max(a, b); //unique recipes
    }
    return union === 0 ? 0 : intersection / union;
}
//ingredient overlap similarity using jaccard
function ingredientOverlap(ingredientsA, ingredientsB) {
    const intersection = new Set([...ingredientsA].filter((ing) => ingredientsB.has(ing)));
    const union = new Set([...ingredientsA, ...ingredientsB]);
    return union.size === 0 ? 0 : intersection.size / union.size;
}
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
        const userIngredients = new Set();
        const userMap = (0, recipeMap_1.recipeMap)(currUser.saved, currUser.liked, userIngredients);
        const otherUsers = yield prisma_1.default.user.findMany({
            where: { id: { not: currUser.id } },
            include: { saved: true, liked: true },
        });
        const suggestions = otherUsers
            .map((user) => {
            const otherIngredients = new Set();
            const otherMap = (0, recipeMap_1.recipeMap)(user.saved, user.liked, otherIngredients);
            //calculating similarity score for both recipe and ingredient based
            const recipeScore = recipeSimilar(userMap, otherMap);
            const ingredientScore = ingredientOverlap(userIngredients, otherIngredients);
            const finalScore = 0.7 * recipeScore + 0.3 * ingredientScore;
            return {
                id: user.id,
                username: user.username,
                similarity: parseFloat(finalScore.toFixed(2)),
                recipeScore: parseFloat(recipeScore.toFixed(2)),
                ingredientScore: parseFloat(ingredientScore.toFixed(2)),
            };
        })
            .filter((s) => s.similarity > 0.1) //filter out users who have little similarity
            .sort((a, b) => b.similarity - a.similarity) //sort from highest similarity
            .slice(0, 5); //top 5 users with the highest similarity
        res.json(suggestions);
    }
    catch (err) {
        console.error("error generating friend suggestions: ", err);
        res.status(500).json({ error: "internal server error" });
    }
}));
exports.default = router;
