import {Router} from "express";
import prisma from "../prisma";
import requireAuth from "../middleware/requireAuth";

const router = Router();
const SPOON_KEY = process.env.SPOON_KEY!;

router.get("/meal-plan", requireAuth, async (req, res) => {
    try{
        const username = req.session.user?.username;
    const user = await prisma.user.findUnique({
        where: {username},
        include: {
            mealPlans: {
                orderBy: {createdAt: "desc"},
                take: 1,
            },
        },
    });

    const plan = user?.mealPlans?.[0];
    if (!plan) {
        res.status(404).json({error: "no plan found"});
        return;
    }

    const nutrition = {
        weekly: {calories: 0, protein: 0, carbs: 0},
        daily: {} as Record<string, {calories: number; protein: number; carbs: number}>,
    };

    const days = plan.plan as {
        day: string;
        meals: {spoonacularId: number; title: string; servings: number}[];
    }[];

    for (const entry of days) {
        let dailyTotal = {calories: 0, protein: 0, carbs: 0};

        for (const meal of entry.meals) {
            const info = await fetch(`https://api.spoonacular.com/recipes/${meal.spoonacularId}/nutritionWidget.json?apiKey=${SPOON_KEY}`);
            if (!info.ok) {
                console.error("spoonacular failed: ", await info.text());
                res.status(500).json({error:"failed to fetch nutrition"});
                return;
            }
            const nutritionData = await info.json();
            const servings = meal.servings || 1;

            const calories = parseInt(nutritionData.calories);
            const protein = parseFloat(nutritionData.protein.replace("g", ""));
            const carbs = parseFloat(nutritionData.carbs.replace("g", ""));

            dailyTotal.calories += calories * servings;
            dailyTotal.protein += protein * servings;
            dailyTotal.carbs += carbs * servings;
        }

        nutrition.daily[entry.day] = dailyTotal;
        nutrition.weekly.calories += dailyTotal.calories;
        nutrition.weekly.protein += dailyTotal.protein;
        nutrition.weekly.carbs += dailyTotal.carbs;
    }
    res.json({plan: days, nutrition});
    } catch (err) {
        console.error("error in /meal-plan: ", err);
        res.status(500).json({error: "something went wrongin meal-plan"})
    }
});

router.get("/meal-plan/history", requireAuth, async (req, res) => {
    const username = req.session.user?.username;
    const user = await prisma.user.findUnique({
        where: {username},
        include: {
            mealPlans: {
                orderBy: {createdAt: "desc"},
                take: 5,
            },
        },
    });
    if (!user) {
        res.status(404).json({error: "user not found"});
        return;
    }

    res.json(user.mealPlans)
})
export default router;