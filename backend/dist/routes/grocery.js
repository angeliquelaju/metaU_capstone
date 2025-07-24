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
const SPOON_KEY = process.env.SPOON_KEY;
router.get("/grocery", requireAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const username = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.username;
        const user = yield prisma_1.default.user.findUnique({
            where: { username },
            include: {
                mealPlans: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
        });
        const mealPlan = (_b = user === null || user === void 0 ? void 0 : user.mealPlans) === null || _b === void 0 ? void 0 : _b[0];
        if (!mealPlan || !mealPlan.plan) {
            res.status(404).json({ error: "no generated plan found" });
            return;
        }
        const plan = mealPlan.plan;
        //organize the ingredients by aisle groups ex. produce
        const groupedIngredients = {};
        for (const day of plan) {
            for (const meal of day.meals) {
                const id = meal.spoonacularId;
                const userServings = (_c = meal.servings) !== null && _c !== void 0 ? _c : 1;
                const response = yield fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.SPOON_KEY}`);
                const data = yield response.json();
                const recipeServings = data.servings || 1;
                const multiplier = userServings / recipeServings;
                //looping through all the ingredients in the recipe
                for (const ing of data.extendedIngredients) {
                    const name = ((_d = ing.nameClean) === null || _d === void 0 ? void 0 : _d.toLowerCase()) || ing.name.toLowerCase();
                    const aisle = ing.aisle || "other";
                    const originalAmount = ing.amount || 1;
                    const unit = ing.unit || "unit";
                    const adjustedAmount = originalAmount * multiplier;
                    //create an aisle group object if it does not exist
                    if (!groupedIngredients[aisle])
                        groupedIngredients[aisle] = {};
                    //create an ingredient obect in aisle group if it does not exist
                    if (!groupedIngredients[aisle][name]) {
                        groupedIngredients[aisle][name] = { amount: 0, unit };
                    }
                    groupedIngredients[aisle][name].amount += adjustedAmount;
                }
            }
        }
        //converting grouped ingredients into an array format
        const output = Object.entries(groupedIngredients).map(([category, ingredients]) => ({
            category,
            ingredients: Object.entries(ingredients).map(([name, { amount, unit }]) => ({
                name,
                amount: Math.round(amount * 100) / 100,
                unit,
            })),
        }));
        res.json(output);
    }
    catch (err) {
        console.error("error in /grocery: ", err);
        res.status(500).json({ error: "something went wrong in grocery" });
    }
}));
exports.default = router;
