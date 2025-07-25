import { Router } from "express";
import prisma from "../prisma";
import requireAuth from "../middleware/requireAuth";
import {nutritionInfo} from "../utils/nutritionCache"

const router = Router();
const SPOON_KEY = process.env.SPOON_KEY!;

router.get("/meal-plan", requireAuth, async (req, res) => {
  try {
    const username = req.session.user?.username;
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        mealPlans: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const plan = user?.mealPlans?.[0];
    if (!plan) {
      res.status(404).json({ error: "no plan found" });
      return;
    }

    const days = plan.plan as {
      day: string;
      meals: { spoonacularId: number; title: string; servings: number }[];
    }[];

    const nutrition = {
      weekly: { calories: 0, protein: 0, carbs: 0 },
      daily: {} as Record<
        string,
        { calories: number; protein: number; carbs: number }
      >,
    };

    //flatten the meal plan (includes a list of meals for each day) into a single array of all meals across the week
    //this allows same meals eaten multiple times a week to be fetched just once, gets all the unique recipe Ids
    const allMeals = days.flatMap((d) => d.meals);
    const uniqueId = [...new Set(allMeals.map((m) => m.spoonacularId))];

    //fetch all unique recipe's nutritional data in parallel by sending out multiple async api request using promise.all
    //so instead of waiting n times, it'd just be 1 time
    const spoonacularRes = await Promise.all(
      uniqueId.map(async (id) => nutritionInfo(id))
    );

    //accessing the recipe's nutrition info by id in a map has O(1) time
    const nutritionMap = new Map<
      number,
      { calories: number; protein: number; carbs: number }
    >();
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
        const servings = meal.servings ?? 1;
        if (!nutrient) continue;

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
  } catch (err) {
    console.error("error in /meal-plan: ", err);
    res.status(500).json({ error: "something went wrongin meal-plan" });
  }
});

router.get("/meal-plan/history", requireAuth, async (req, res) => {
  const username = req.session.user?.username;
  const user = await prisma.user.findUnique({
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
});

router.get("/nutrition/:id", requireAuth, async(req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({error: "invalid id"});
    return;
  }
  try {
    const nutrition = await nutritionInfo(id);
    res.json(nutrition);
  } catch (err) {
    console.error("nutrition fetch failed: ", err);
    res.status(500).json({error: "cannot fetch nutrition"});
  }
});

export default router;
