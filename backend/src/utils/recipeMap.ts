//group ingredient words (ex. chicken breast -> chicken)
export function ingredientsGrouping(ing: string): string[] {
  return ing.trim().toLowerCase().split(/\s+/);
}

export function recipeMap(
  saved: { id: string; ingredients?: string[] }[],
  liked: { id: string; ingredients?: string[] }[],
  ingredientSet?: Set<string>
): Map<string, number> {
  const map = new Map<string, number>();

  //assigning weights for the recipes - 3 if liked and saved, 1 if saved only
  for (const recipe of saved) {
    const likedNSaved = liked.some((r) => r.id === recipe.id);
    map.set(recipe.id, likedNSaved ? 3 : 1);
    if (ingredientSet && recipe.ingredients) {
      recipe.ingredients.forEach((ing) => {
        const words = ingredientsGrouping(ing);
        words.forEach((word) => ingredientSet.add(word));
      });
    }
  }

  //assigning weights for the recipes - 2 if liked only
  for (const likedRecipe of liked) {
    if (!map.has(likedRecipe.id)) {
      map.set(likedRecipe.id, 2);
      if (ingredientSet && likedRecipe.ingredients) {
        likedRecipe.ingredients.forEach((ing) => {
          const words = ingredientsGrouping(ing);
          words.forEach((word) => ingredientSet.add(word));
        });
      }
    }
  }
  return map;
}
