export function getNutritionDiff(
  goals: { calories: number; protein: number; carbs: number },
  current: { calories: number; protein: number; carbs: number },
  nutrition: { calories: number; protein: number; carbs: number }
): number {
  const diff = (goal: number, actual: number) => goal - actual;
  return (
    diff(goals.calories, current.calories) * nutrition.calories +
    diff(goals.protein, current.protein) * nutrition.protein +
    diff(goals.carbs, current.carbs) * nutrition.carbs
  );
}

export function getExcess(
  goals: { calories: number; protein: number; carbs: number },
  current: { calories: number; protein: number; carbs: number },
  nutrition: { calories: number; protein: number; carbs: number }
): number {
  return (
    Math.max(0, current.calories - goals.calories) * nutrition.calories +
    Math.max(0, current.protein - goals.protein) * nutrition.protein +
    Math.max(0, current.carbs - goals.carbs) * nutrition.carbs
  );
}
