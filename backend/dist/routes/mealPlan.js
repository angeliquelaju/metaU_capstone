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
const nutritionCache_1 = require("../utils/nutritionCache");
const router = (0, express_1.Router)();
const SPOON_KEY = process.env.SPOON_KEY;
router.get("/meal-plan", requireAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
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
        const plan = (_b = user === null || user === void 0 ? void 0 : user.mealPlans) === null || _b === void 0 ? void 0 : _b[0];
        if (!plan) {
            res.status(404).json({ error: "no plan found" });
            return;
        }
        const days = plan.plan;
        const nutrition = {
            weekly: { calories: 0, protein: 0, carbs: 0 },
            daily: {},
        };
        //flatten the meal plan (includes a list of meals for each day) into a single array of all meals across the week
        //this allows same meals eaten multiple times a week to be fetched just once, gets all the unique recipe Ids
        const allMeals = days.flatMap((d) => d.meals);
        const uniqueId = [...new Set(allMeals.map((m) => m.spoonacularId))];
        //fetch all unique recipe's nutritional data in parallel by sending out multiple async api request using promise.all
        //so instead of waiting n times, it'd just be 1 time
        const spoonacularRes = yield Promise.all(uniqueId.map((id) => __awaiter(void 0, void 0, void 0, function* () { return (0, nutritionCache_1.nutritionInfo)(id); })));
        //accessing the recipe's nutrition info by id in a map has O(1) time
        const nutritionMap = new Map();
        for (const item of spoonacularRes) {
            if (item) {
                nutritionMap.set(item.spoonacularId, {
                    calories: item.calories,
                    protein: item.protein,
                    carbs: item.carbs,
                });
            }
        }
        //calculate daily and weekly nutrition info
        for (const entry of days) {
            let dailyTotal = { calories: 0, protein: 0, carbs: 0 };
            for (const meal of entry.meals) {
                const nutrient = nutritionMap.get(meal.spoonacularId);
                const servings = (_c = meal.servings) !== null && _c !== void 0 ? _c : 1;
                if (!nutrient)
                    continue;
                dailyTotal.calories += nutrient.calories * servings;
                dailyTotal.protein += nutrient.protein * servings;
                dailyTotal.carbs += nutrient.carbs * servings;
            }
            nutrition.daily[entry.day] = dailyTotal;
            nutrition.weekly.calories += dailyTotal.calories;
            nutrition.weekly.protein += dailyTotal.protein;
            nutrition.weekly.carbs += dailyTotal.carbs;
        }
        res.json({ plan: days, nutrition });
    }
    catch (err) {
        console.error("error in /meal-plan: ", err);
        res.status(500).json({ error: "something went wrongin meal-plan" });
    }
}));
router.get("/meal-plan/history", requireAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const username = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.username;
    const user = yield prisma_1.default.user.findUnique({
        where: { username },
        include: {
            mealPlans: {
                orderBy: { createdAt: "desc" },
                take: 5,
            },
        },
    });
    if (!user) {
        res.status(404).json({ error: "user not found" });
        return;
    }
    res.json(user.mealPlans);
}));
router.get("/nutrition/:id", requireAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ error: "invalid id" });
        return;
    }
    try {
        const nutrition = yield (0, nutritionCache_1.nutritionInfo)(id);
        res.json(nutrition);
    }
    catch (err) {
        console.error("nutrition fetch failed: ", err);
        res.status(500).json({ error: "cannot fetch nutrition" });
    }
}));
exports.default = router;
