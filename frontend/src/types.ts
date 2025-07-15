export type GroceryItem = {
  category: string;
  ingredients: {
    name: string;
    amount: number;
    unit: string;
  }[];
};

export type SpoonacularRecipe = {
  id: number;
  title: string;
};
