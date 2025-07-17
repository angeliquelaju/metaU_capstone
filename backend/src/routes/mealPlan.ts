import { Router } from "express";
import prisma from "../prisma";
import requireAuth from "../middleware/requireAuth";

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
      uniqueId.map(async (id) => {
        const response = await fetch(
          `https://api.spoonacular.com/recipes/${id}/nutritionWidget.json?apiKey=${SPOON_KEY}`
        );
        if (!response.ok) {
          console.error(
            `error fetching spoonacular recipe ${id}: `,
            await response.text()
          );
          return null;
        }
        const data = await response.json();
        return {
          id,
          calories: parseInt(data.calories),
          protein: parseFloat(data.protein.replace("g", "")),
          carbs: parseFloat(data.carbs.replace("g", "")),
        };
      })
    );
    
    //accessing the recipe's nutrition info by id in a map has O(1) time 
    const nutritionMap = new Map<number, {calories: number, protein: number, carbs: number}>();
    for (const item of spoonacularRes) {
        if (item) {
            nutritionMap.set(item.id, {
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
export default router;
