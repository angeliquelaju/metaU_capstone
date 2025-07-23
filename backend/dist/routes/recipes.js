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
const recipeMap_1 = require("../utils/recipeMap");
require("express-session");
const SPOON_KEY = process.env.SPOON_KEY;
//saving recipes
const router = (0, express_1.Router)();
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
            where: {
                id,
                userSaves: {
                    some: {
                        id: user.id,
                    },
                },
            },
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
            data: {
                saved: {
                    connect: { id: recipe.id },
                },
            },
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
//delete recipes that have been saved
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
            data: {
                saved: {
                    disconnect: { id },
                },
            },
        });
        res.status(200).json({ message: "recipe removed" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "internal error" });
    }
}));
//liking recipes
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
                userLikes: {
                    some: { id: user.id },
                },
            },
        });
        if (alreadyLiked) {
            res.status(409).json({ error: "recipe liked already" });
            return;
        }
        yield prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                liked: {
                    connect: { id: updatedRecipe.id },
                },
            },
        });
        res.status(200).json({ message: "recipe liked" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "server error" });
    }
}));
//getting the recipes that have been liked
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
//unlike recipes
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
            data: {
                liked: {
                    disconnect: { id },
                },
            },
        });
        res.status(200).json({ message: "recipe unliked" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "internal error" });
    }
}));
//getting personalized recipes
router.get("/recipes/personalized", requireAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const username = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.username;
    if (!username) {
        res.status(401).json({ error: "not logged in" });
        return;
    }
    try {
        const userwithLike = yield prisma_1.default.user.findUnique({
            where: { username },
            include: { liked: true },
        });
        if (!userwithLike || userwithLike.liked.length === 0) {
            res.status(404).json({ error: "no liked recipes" });
            return;
        }
        //get ingredients from the liked recipes
        const allIngredients = userwithLike.liked.flatMap((r) => r.ingredients || []);
        if (allIngredients.length === 0) {
            res.status(400).json({ error: "no ingredients" });
            return;
        }
        //group ingredient words (ex. chicken breast -> chicken)
        const tokens = allIngredients.flatMap((ing) => 
        //.trim().split(/\s+/) takes out all whitespaces and splits it no matter what whitespace there is
        ing.trim().toLowerCase().split(/\s+/));
        const frequency = {};
        for (const token of tokens) {
            frequency[token] = (frequency[token] || 0) + 1;
        }
        const sorted = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
        const topIngredients = sorted
            .slice(0, 5)
            .map(([key]) => key)
            .join(",");
        const response = yield fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.SPOON_KEY}&includeIngredients=${topIngredients}&number=10&addRecipeInformation=true`);
        if (!response.ok)
            throw new Error("failed to get personalized recipes");
        const data = yield response.json();
        res.json(data.results);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "server error" });
    }
}));
//get other user's saved recipes using username
router.get("/recipes/user/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    try {
        const user = yield prisma_1.default.user.findUnique({
            where: { username },
            include: { saved: true },
        });
        if (!user) {
            res.status(404).json({ error: "user not found" });
            return;
        }
        res.json(user.saved);
    }
    catch (err) {
        console.error("error in public user recipe fetch: ", err);
        res.status(500).json({ error: "internal error" });
    }
}));
//gets users patterns (see how they interact with all the recipes) not just the ones that overlap
//how much recipes a user has interacted with does not effect the score as it uses magnitude
function cosineSimilarity(a, b) {
    const allRecipeIds = new Set([...a.keys(), ...b.keys()]);
    let dot = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    for (const id of allRecipeIds) {
        const valA = a.get(id) || 0;
        const valB = b.get(id) || 0;
        dot += valA * valB; //calculate how much users interact with the same recipe
        //overall interaction for that user
        magnitudeA += valA ** 2;
        magnitudeB += valB ** 2;
    }
    if (magnitudeA === 0 || magnitudeB === 0)
        return 0;
    return dot / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB)); //final similarity score (closer to 1 more similar they are)
}
router.get("/recipes/recommended", requireAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        //current user's interactions
        const userSaved = (0, recipeMap_1.recipeMap)(currUser.saved, currUser.liked);
        const seenRecipes = new Set();
        for (const recipeId of userSaved.keys()) {
            seenRecipes.add(recipeId);
        }
        //other user's interactions
        const otherUsers = yield prisma_1.default.user.findMany({
            where: { id: { not: currUser.id } },
            include: { saved: true, liked: true },
        });
        const scores = new Map();
        for (const user of otherUsers) {
            //map of weights
            const otherSaved = (0, recipeMap_1.recipeMap)(user.saved, user.liked);
            //map of recipeIds and its information (title, ingredients, etc)
            const otherRecipe = new Map();
            //adding all saved recipes to recipe map
            for (const recipe of user.saved) {
                otherRecipe.set(recipe.id, recipe);
            }
            //adding liked-only recipes that were not saved
            for (const liked of user.liked) {
                if (!otherRecipe.has(liked.id)) {
                    otherRecipe.set(liked.id, liked);
                }
            }
            const sim = cosineSimilarity(userSaved, otherSaved); //gets similarity score for current user and other user
            if (sim === 0)
                continue; //skip users who have 0 similarity score
            for (const [recipeId, score] of otherSaved.entries()) {
                if (seenRecipes.has(recipeId))
                    continue; //skip receipes that the current user has interacted with
                const existing = scores.get(recipeId);
                //calculating that specific user's contribution to the recipe score
                //user similarity * their weight (1,2,3) for that recipe
                const totalScore = sim * score;
                if (existing) {
                    //total of all the score and other user similarities
                    existing.totalWeighted += totalScore;
                    existing.numUsers.add(user.id.toString());
                }
                else {
                    scores.set(recipeId, {
                        recipe: otherRecipe.get(recipeId),
                        totalWeighted: totalScore,
                        numUsers: new Set([user.id.toString()]),
                    });
                }
            }
        }
        const topRecipes = [...scores.values()]
            .map(({ recipe, totalWeighted, numUsers }) => {
            //make the score consistent by dividing it by the maximum weight (3). total weight can be over 1
            //cause there are multiple user scores added together. max the score at 100 even if totalWeighted is over 100
            const denominator = 3 * numUsers.size;
            const percentage = denominator > 0 ? (totalWeighted / denominator) * 100 : 0;
            return Object.assign(Object.assign({}, recipe), { score: parseFloat(percentage.toFixed(2)) });
        })
            .sort((a, b) => b.score - a.score);
        res.json(topRecipes);
        return;
    }
    catch (err) {
        console.error("recommendation error: ", err);
        res.status(500).json({ error: "internal server error" });
    }
}));
exports.default = router;
