import prisma from "../prisma";

const SPOON_KEY = process.env.SPOON_KEY!;

export async function nutritionInfo(spoonacularId: number) {
  const cached = await prisma.nutritionCache.findUnique({
    where: {spoonacularId},
  })

  if (cached) return cached;

  const res = await fetch(
    `https://api.spoonacular.com/recipes/${spoonacularId}/nutritionWidget.json?apiKey=${SPOON_KEY}`
  );
  const data = await res.json();

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