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
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const prisma_1 = __importDefault(require("../prisma"));
const router = (0, express_1.Router)();
//liking recipes
//checks if the user exists and upserts the recipe if it does not exist
//it updates the ingredients list if it is missing, then connects the user to the recipe
router.post("/recipes/like", requireAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id, title, image, ingredients } = req.body;
    const username = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.username;
    if (!username) {
        res.status(401).json({ error: "not logged in" });
        return;
    }
    try {
        const user = yield prisma_1.default.user.findUnique({
            where: { username },
        });
        if (!user) {
            res.status(404).json({ error: "user not found" });
            return;
        }
        const existingRecipe = yield prisma_1.default.recipe.findUnique({
            where: { id },
        });
        let updatedRecipe;
        if (existingRecipe) {
            if (!existingRecipe.ingredients ||
                existingRecipe.ingredients.length === 0) {
                updatedRecipe = yield prisma_1.default.recipe.update({
                    where: { id },
                    data: { ingredients },
                });
            }
            else {
                updatedRecipe = existingRecipe;
            }
        }
        else {
            updatedRecipe = yield prisma_1.default.recipe.create({
                data: { id, title, image, ingredients },
            });
        }
        const alreadyLiked = yield prisma_1.default.recipe.findFirst({
            where: {
                id,
                userLikes: { some: { id: user.id } }
            },
        });
        if (alreadyLiked) {
            res.status(409).json({ error: "recipe liked already" });
            return;
        }
        yield prisma_1.default.user.update({
            where: { id: user.id },
            data: { liked: { connect: { id: updatedRecipe.id } } },
        });
        res.status(200).json({ message: "recipe liked" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "server error" });
    }
}));
//getting the recipes that have been liked by a user
router.get("/recipes/likedRecipes", requireAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const username = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.username;
    if (!username) {
        res.status(401).json({ error: "not logged in" });
        return;
    }
    try {
        const userwithLiked = yield prisma_1.default.user.findUnique({
            where: { username },
            include: { liked: true },
        });
        if (!userwithLiked) {
            res.status(404).json({ error: "user not found" });
            return;
        }
        res.status(200).json(userwithLiked.liked);
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "internal error" });
    }
}));
//unlike recipes that have been liked
//checks if the user exists and updates the liked recipes to disconnect that recipe from the user
router.delete("/recipes/unlike/:id", requireAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const username = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.username;
    const { id } = req.params;
    if (!username) {
        res.status(401).json({ error: "not logged in" });
        return;
    }
    try {
        const user = yield prisma_1.default.user.findUnique({
            where: { username },
        });
        if (!user) {
            res.status(404).json({ error: "user not found" });
            return;
        }
        yield prisma_1.default.user.update({
            where: { id: user.id },
            data: { liked: { disconnect: { id } } },
        });
        res.status(200).json({ message: "recipe unliked" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "internal error" });
    }
}));
exports.default = router;
