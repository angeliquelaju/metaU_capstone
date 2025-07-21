import { Router } from "express";
import prisma from "../prisma";
import requireAuth from "../middleware/requireAuth";

const router = Router();
const SPOON_KEY = process.env.SPOON_KEY!;

router.get("/grocery", requireAuth, async (req, res) => {
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

    const mealPlan = user?.mealPlans?.[0];

    if (!mealPlan || !mealPlan.plan) {
      res.status(404).json({ error: "no generated plan found" });
      return;
    }

    const plan = mealPlan.plan as {
      day: string;
      meals: { spoonacularId: number; servings: number }[];
    }[];

    //organize the ingredients by aisle groups ex. produce
    const groupedIngredients: Record<
      string,
      Record<string, { amount: number; unit: string }>
    > = {};

    for (const day of plan) {
      for (const meal of day.meals) {
        const id = meal.spoonacularId;
        const userServings = meal.servings ?? 1;
        const response = await fetch(
          `https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.SPOON_KEY}`,
        );
        const data = await response.json();

        const recipeServings = data.servings || 1;
        const multiplier = userServings / recipeServings;

        //looping through all the ingredients in the recipe
        for (const ing of data.extendedIngredients) {
          const name = ing.nameClean?.toLowerCase() || ing.name.toLowerCase();
          const aisle = ing.aisle || "other";
          const originalAmount = ing.amount || 1;
          const unit = ing.unit || "unit";
          const adjustedAmount = originalAmount * multiplier;

          //create an aisle group object if it does not exist
          if (!groupedIngredients[aisle]) groupedIngredients[aisle] = {};

          //create an ingredient obect in aisle group if it does not exist
          if (!groupedIngredients[aisle][name]) {
            groupedIngredients[aisle][name] = { amount: 0, unit };
          }
          groupedIngredients[aisle][name].amount += adjustedAmount;
        }
      }
    }

    //converting grouped ingredients into an array format
    const output = Object.entries(groupedIngredients).map(
      ([category, ingredients]) => ({
        category,
        ingredients: Object.entries(ingredients).map(
          ([name, { amount, unit }]) => ({
            name,
            amount: Math.round(amount * 100) / 100,
            unit,
          }),
        ),
      }),
    );
    res.json(output);
  } catch (err) {
    console.error("error in /grocery: ", err);
    res.status(500).json({ error: "something went wrong in grocery" });
  }
});
export default router;
