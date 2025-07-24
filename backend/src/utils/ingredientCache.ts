import prisma from "../prisma";

const SPOON_KEY = process.env.SPOON_KEY!;

export async function ingredientInfo(spoonacularId: number) {
  const cached = await prisma.ingredientCache.findUnique({
    where: {spoonacularId},
  })

  if (cached) return cached;

  const res = await fetch(
    `https://api.spoonacular.com/recipes/${spoonacularId}/information?apiKey=${SPOON_KEY}`
  );

  if (!res.ok) {
    throw new Error(`failed to fetch info recipe ${spoonacularId}`);
  }
  const data = await res.json();
  const parsed = {
    spoonacularId,
    ingredients: data,
  };
  await prisma.ingredientCache.upsert({
    where: {spoonacularId},
    update: parsed,
    create: parsed,
  });
  return data;
}