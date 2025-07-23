import { recipeMap } from "../utils/recipeMap";

//calculates recipe similarity using weighted jaccard similarity
//weight: 1 (if saved), 2 (if liked), 3 (if saved and liked)
export function recipeSimilar(
  mapA: Map<string, number>,
  mapB: Map<string, number>
): number {
  const allRecipeIds = new Set([...mapA.keys(), ...mapB.keys()]);
  let intersection = 0;
  let union = 0;
  for (const id of allRecipeIds) {
    const a = mapA.get(id) || 0;
    const b = mapB.get(id) || 0;
    intersection += Math.min(a, b); //min interaction of that recipe
    union += Math.max(a, b); //max interaction of that recipe
  }
  return union === 0 ? 0 : intersection / union;
}

//ingredient overlap similarity using jaccard
export function ingredientOverlap(
  ingredientsA: Set<string>,
  ingredientsB: Set<string>
): number {
  // both users saved ingredients  
  const intersection = new Set(
    [...ingredientsA].filter((ing) => ingredientsB.has(ing))
  );
  //unique recipes
  const union = new Set([...ingredientsA, ...ingredientsB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

export function top5Users(currUser: any, otherUsers: any[]) {
  const userIngredients = new Set<string>();
  const userMap = recipeMap(currUser.saved, currUser.liked, userIngredients);

  return otherUsers
    .map((user) => {
      const otherIngredients = new Set<string>();
      const otherMap = recipeMap(user.saved, user.liked, otherIngredients);

      //calculating similarity score for both recipe and ingredient based
      const recipeScore = recipeSimilar(userMap, otherMap);
      const ingredientScore = ingredientOverlap(
        userIngredients,
        otherIngredients
      );
      const finalScore = 0.7 * recipeScore + 0.3 * ingredientScore;

      return {
        user,
        finalScore,
        recipeScore,
        ingredientScore,
      };
    })
    .filter(({ finalScore }) => finalScore > 0.1) //filter out users who have little similarity
    .sort((a, b) => b.finalScore - a.finalScore) //sort from highest similarity
    .slice(0, 5); //top 5 users with the highest similarity
}
