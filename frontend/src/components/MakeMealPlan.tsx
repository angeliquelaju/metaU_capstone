const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type Props = {
  mealCounts: any;
  setMealCounts: any;
  recipePreferences: any;
  setRecipePreferences: any;
  handleGenerate: any;
  savedRecipes: { id: string; title: string }[];
};

export default function MakeMealPlan({
  mealCounts,
  setMealCounts,
  recipePreferences,
  setRecipePreferences,
  handleGenerate,
}: Props) {
  return (
    <div>
      <h3>Meals Per Day</h3>
      {DAYS.map((day) => (
        <div key={day}>
          {day}:
          <input
            type="number"
            value={mealCounts[day]}
            min={0}
            max={6}
            onChange={(e) =>
              setMealCounts({ ...mealCounts, [day]: +e.target.value })
            }
          />
        </div>
      ))}

      <h3>Recipe Preferences</h3>
      {recipePreferences.length === 0 ? (
        <p>No Saved Recipes</p>
      ) : (
        recipePreferences.map((r: any, i: number) => (
          <div key={r.spoonacularId}>
            {r.title}: eat
            <input
              type="number"
              value={r.servings}
              min={0}
              max={10}
              onChange={(e) => {
                const updated = [...recipePreferences];
                updated[i].servings = +e.target.value;
                setRecipePreferences(updated);
              }}
            />
            times
          </div>
        ))
      )}
      <button onClick={handleGenerate}>Generate Meal Plan</button>
    </div>
  );
}
