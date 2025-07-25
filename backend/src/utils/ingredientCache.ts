import prisma from "../prisma";
import { recipeInfo } from "./spoonacular";

export async function ingredientInfo(spoonacularId: number) {
  const cached = await prisma.ingredientCache.findUnique({
    where: {spoonacularId},
  })

  if (cached) return cached.ingredients;

  const data = await recipeInfo(spoonacularId);
  const parsed = {
    spoonacularId,
    ingredients: data,
  };
  await prisma.ingredientCache.upsert({
    where: {spoonacularId},
    update: parsed,
    create: parsed,
  });
  return parsed.ingredients;
}