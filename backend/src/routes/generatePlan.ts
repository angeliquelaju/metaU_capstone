import { Router } from "express";
import prisma from "../prisma";
import requireAuth from "../middleware/requireAuth";

const router = Router();

router.post("/generate-plan", requireAuth, async (req, res) => {
  const username = req.session.user?.username;
  const { recipePreferences, dailyMeals } = req.body;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    res.status(401).json({ error: "user not found" });
    return;
  }
  const DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const expanded: { title: string; spoonacularId: number; servings: number }[] = [];
  for (const r of recipePreferences) {
    if (r.servings > 0) {
        expanded.push({ title: r.title, spoonacularId: r.spoonacularId, servings: r.servings });
    }
  }

  for (let i = expanded.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [expanded[i], expanded[j]] = [expanded[j], expanded[i]];
  }

  const plan: {
    day: string;
    meals: { title: string; spoonacularId: number; servings: number }[];
  }[] = [];
  let index = 0;

  for (const day of DAYS) {
    const mealCount = dailyMeals[day] || 0;
    const meals: { title: string; spoonacularId: number; servings: number }[] = [];
    for (let m = 0; m < mealCount; m++) {
      if (index >= expanded.length) break;
      meals.push(expanded[index]);
      index++;
    }
    plan.push({ day, meals });
  }
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  await prisma.mealPlan.create({
    data: {
      userId: user.id,
      weekStart,
      plan,
    },
  });
  res.json({ message: "plan generated", plan });
});

export default router;
