import { Router } from "express";
import prisma from "../prisma";
import requireAuth from "../middleware/requireAuth";

const router = Router();

//calculates recipe similarity using weighted jaccard similarity
//weight: 1 (if saved), 2 (if liked), 3 (if saved and liked)
function recipeSimilar(
  mapA: Map<string, number>,
  mapB: Map<string, number>
): number {
  const allRecipeIds = new Set([...mapA.keys(), ...mapB.keys()]);
  let intersection = 0;
  let union = 0;
  for (const id of allRecipeIds) {
    const a = mapA.get(id) || 0;
    const b = mapB.get(id) || 0;
    intersection += Math.min(a, b); // both users saved recipes
    union += Math.max(a, b); //unique recipes
  }
  return union === 0 ? 0 : intersection / union;
}

//ingredient overlap similarity using jaccard
function ingredientOverlap(
  ingredientsA: Set<string>,
  ingredientsB: Set<string>
): number {
  const intersection = new Set(
    [...ingredientsA].filter((ing) => ingredientsB.has(ing))
  );
  const union = new Set([...ingredientsA, ...ingredientsB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

//group ingredient words (ex. chicken breast -> chicken)
function ingredientsGrouping(ing: string): string {
  return ing.trim().toLowerCase().replace(/\s+/, " ");
}

router.get("/friends/suggestions", requireAuth, async (req, res) => {
  const username = req.session.user?.username;
  if (!username) {
    res.status(401).json({ error: "user not found" });
    return;
  }

  try {
    const currUser = await prisma.user.findUnique({
      where: { username },
      include: { saved: true, liked: true },
    });

    if (!currUser) {
      res.status(404).json({ error: "user not found" });
      return;
    }

    const userSaved = new Map<string, number>();
    const userIngredients = new Set<string>();

    for (const recipe of currUser.saved) {
      const liked = currUser.liked.some((r) => r.id === recipe.id);
      userSaved.set(recipe.id, liked ? 3 : 1); //assign weights to recipe
      recipe.ingredients?.forEach((ing) =>
        userIngredients.add(ingredientsGrouping(ing))
      );
    }

    const otherUsers = await prisma.user.findMany({
      where: { id: { not: currUser.id } },
      include: { saved: true, liked: true },
    });
    const suggestions = otherUsers
      .map((user) => {
        const othersSaved = new Map<string, number>();
        const otherIngredients = new Set<string>();
        for (const recipe of user.saved) {
          const liked = user.liked.some((r) => r.id === recipe.id);
          othersSaved.set(recipe.id, liked ? 3 : 1);
          recipe.ingredients?.forEach((ing) =>
            otherIngredients.add(ingredientsGrouping(ing))
          );
        }

        for (const liked of user.liked) {
          if (!othersSaved.has(liked.id)) {
            othersSaved.set(liked.id, 2);
            liked.ingredients?.forEach((ing: string) =>
              otherIngredients.add(ingredientsGrouping(ing))
            );
          }
        }

        //calculating similarity score for both recipe and ingredient based
        const recipeScore = recipeSimilar(userSaved, othersSaved);
        const ingredientScore = ingredientOverlap(
          userIngredients,
          otherIngredients
        );
        const finalScore = 0.7 * recipeScore + 0.3 * ingredientScore;

        return {
          id: user.id,
          username: user.username,
          similarity: parseFloat(finalScore.toFixed(2)),
          recipeScore: parseFloat(recipeScore.toFixed(2)),
          ingredientScore: parseFloat(ingredientScore.toFixed(2)),
        };
      })
      .filter((s) => s.similarity > 0.1) //filter out users who have little similarity
      .sort((a, b) => b.similarity - a.similarity) //sort from highest similarity
      .slice(0, 5); //top 5 users with the highest similarity

    res.json(suggestions);
  } catch (err) {
    console.error("error generating friend suggestions: ", err);
    res.status(500).json({ error: "internal server error" });
  }
});

export default router;
