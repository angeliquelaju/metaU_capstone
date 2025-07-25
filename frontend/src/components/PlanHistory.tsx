import React from "react";
type Props = {
  planHistory: any[];
  savedRecipes: { id: string; title: string }[];
  setMealCounts: any;
  setRecipePreferences: any;
};

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function PlanHistory({
  planHistory,
  savedRecipes,
  setMealCounts,
  setRecipePreferences,
}: Props) {
  const handlePlanHistory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPlan = planHistory.find((p) => p.id === +e.target.value);
    if (!selectedPlan) return;

    const parsedPlan = selectedPlan.plan as {
      day: string;
      meals: { title: string; spoonacularId: number; servings: number }[];
    }[];

    const dayMealCounts: Record<string, number> = {};
    for (const day of DAYS) {
      dayMealCounts[day] =
        parsedPlan.find((d) => d.day === day)?.meals.length || 0;
    }
    setMealCounts(dayMealCounts);

    const recipeMap = new Map<number, { title: string; servings: number }>();
    for (const day of parsedPlan) {
      for (const meal of day.meals) {
        const existing = recipeMap.get(meal.spoonacularId);
        if (existing) {
          existing.servings += meal.servings;
        } else {
          recipeMap.set(meal.spoonacularId, {
            title: meal.title,
            servings: meal.servings,
          });
        }
      }
    }

    const populatePreferences: {
      title: string;
      spoonacularId: number;
      servings: number;
    }[] = [];

    for (const recipe of savedRecipes) {
      const id = parseInt(recipe.id);
      const match = recipeMap.get(id);
      populatePreferences.push({
        title: recipe.title,
        spoonacularId: id,
        servings: match ? match.servings : 0,
      });
      recipeMap.delete(id);
    }

    for (const [id, { title, servings }] of recipeMap.entries()) {
      populatePreferences.push({ title, spoonacularId: id, servings });
    }
    setRecipePreferences(populatePreferences);
  };

  return (
    <>
      <h4>use previous plan</h4>
      <select onChange={handlePlanHistory}>
        <option value="">pick a previous plan</option>
        {planHistory.map((p) => (
          <option key={p.id} value={p.id}>
            created at {new Date(p.weekStart).toLocaleDateString()}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => {
          setMealCounts(Object.fromEntries(DAYS.map((d) => [d, 3])));
          setRecipePreferences(
            savedRecipes.map((r) => ({
              title: r.title,
              spoonacularId: parseInt(r.id),
              servings: 1,
            }))
          );
        }}
      >
        clear
      </button>
    </>
  );
}
