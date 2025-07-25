import prisma from "../prisma";
import { recipeNutrition } from "./spoonacular";

export async function nutritionInfo(spoonacularId: number) {
  const cached = await prisma.nutritionCache.findUnique({
    where: {spoonacularId},
  })

  if (cached) return cached;

  const data = await recipeNutrition(spoonacularId);

  const nutrition = {
    spoonacularId,
    calories: parseInt(data.calories),
    protein: parseFloat(data.protein.replace("g", "")),
    carbs: parseFloat(data.carbs.replace("g", "")),
  }
  await prisma.nutritionCache.upsert({
    where: {spoonacularId},
    update: nutrition,
    create: nutrition,
  });
  return nutrition;
}