const SPOON_KEY = process.env.SPOON_KEY!;
const BASE_URL = "https://api.spoonacular.com/recipes";

const connected = (endpoint: string) =>
  `${BASE_URL}/${endpoint}?apiKey=${SPOON_KEY}`;

export const recipeInfo = (id: number) =>
  fetch(connected(`${id}/information`))
    .then((res) => res.json());

export const recipeNutrition = (id: number) =>
  fetch(connected(`${id}/nutritionWidget.json`))
    .then((res) => res.json());
    
export const searchRecipes = async (ingredients: string, number = 10) => {
  const URL = `${BASE_URL}/complexSearch?apiKey=${SPOON_KEY}&includeIngredients=${ingredients}&number=${number}&addRecipeInformation=true`;
  const res = await fetch(URL);
  if (!res.ok) {
    throw new Error("failed to fetch searchRecipes");
  }
  return res.json();
};
