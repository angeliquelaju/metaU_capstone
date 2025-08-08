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
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  //converting the inputted recipe preference into single servings of meals
  //ex. selecting a recipe 3 times = 3 separate meals of stuffed chicken
  const singleMeals: {
    title: string;
    spoonacularId: number;
    servings: number;
  }[] = [];
  for (const recipe of recipePreferences) {
    for (let i = 0; i < recipe.servings; i++) {
      singleMeals.push({
        title: recipe.title,
        spoonacularId: recipe.spoonacularId,
        servings: 1, //each entry = single serving that can be assigned to a day
      });
    }
  }

  //randomize the order of meals across the different days by swapping i (current index) and j (random index between 0 & i)
  for (let i = singleMeals.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [singleMeals[i], singleMeals[j]] = [singleMeals[j], singleMeals[i]];
  }

  //building the meal plan by assigning the randomized meals to the selected days
  const plan: {
    day: string;
    meals: { title: string; spoonacularId: number; servings: number }[];
  }[] = [];
  let index = 0;

  for (const day of DAYS) {
    const mealCount = dailyMeals[day] || 0;
    const mealsForSingleDay: {
      title: string;
      spoonacularId: number;
      servings: number;
    }[] = [];

    //assigning the number of meals according to what is needed that day from the randomized list
    for (let m = 0; m < mealCount; m++) {
      if (index >= singleMeals.length) break;
      mealsForSingleDay.push(singleMeals[index]);
      index++;
    }
    plan.push({ day, meals: mealsForSingleDay });
  }
  const weekStart = new Date();
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
