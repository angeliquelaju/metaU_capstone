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
//saving recipes
//checks if the user exists and if that recipes is already saved 
//if it is not then it is upserted into the database, then connects the user to the recipe
router.post("/recipes/save", requireAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const alreadySaved = yield prisma_1.default.recipe.findFirst({
            where: { id, userSaves: { some: { id: user.id, } } },
        });
        if (alreadySaved) {
            res.status(409).json({ error: "recipe already saved" });
            return;
        }
        const recipe = yield prisma_1.default.recipe.upsert({
            where: { id },
            update: { ingredients: (ingredients === null || ingredients === void 0 ? void 0 : ingredients.length) ? ingredients : undefined },
            create: {
                id,
                title,
                image,
                ingredients: (ingredients === null || ingredients === void 0 ? void 0 : ingredients.length) ? ingredients : [],
            },
        });
        yield prisma_1.default.user.update({
            where: { id: user.id },
            data: { saved: { connect: { id: recipe.id } } },
        });
        res.status(200).json({ message: "recipe saved" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "internal error" });
    }
}));
//getting the recipes that have been saved by a user
router.get("/recipes/user", requireAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const username = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.username;
    if (!username) {
        res.status(401).json({ error: "not logged in" });
        return;
    }
    try {
        const userWithRecipes = yield prisma_1.default.user.findUnique({
            where: { username },
            include: { saved: true },
        });
        res.json((_b = userWithRecipes === null || userWithRecipes === void 0 ? void 0 : userWithRecipes.saved) !== null && _b !== void 0 ? _b : []);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "internal error" });
    }
}));
//remove recipes that have been saved
//checks if the user exists and updates the saved recipes to disconnect that recipe from the user
router.delete("/recipes/remove/:id", requireAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            data: { saved: { disconnect: { id } } },
        });
        res.status(200).json({ message: "recipe removed" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "internal error" });
    }
}));
exports.default = router;
