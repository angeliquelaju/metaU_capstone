import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function MealPlanner() {
  const [savedRecipes, setSavedRecipes] = useState<
    {id: string; title: string}[]>([]);

  const [mealCounts, setMealCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(DAYS.map((d) => [d, 3]))
  );

  const [recipePreferences, setRecipePreferences] = useState<
    { title: string; spoonacularId: number; servings: number }[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadSaved = async () => {
        const res = await fetch("http://localhost:4000/recipes/user", {
            credentials: "include",
        });
        const data = await res.json();
        setSavedRecipes(data);
        setRecipePreferences(
            data.map((r: any) => ({
                title: r.title,
                spoonacularId: parseInt(r.id),
                servings: 1,
            }))
        );
        setLoading(false);
    };
    loadSaved();
  }, []);

  const handleGenerate = async () => {
    const res = await fetch("http://localhost:4000/generate-plan", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipePreferences, dailyMeals: mealCounts }),
    });

    if (res.ok) {
      setMessage("meal plan generated");
      navigate("/grocery");
    } else {
      setMessage("failed to generate");
    }
  };

  if (loading) return <p>loading saved recipes...</p>

  return (
    <div>
      <h2>meal planner</h2>
      <h3>meals per day</h3>
      {DAYS.map((day) => (
        <div key={day}>
          {day}:{" "}
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

      <h3>recipe preferences</h3>
      {recipePreferences.length === 0 ? (
        <p>no saved recipes</p>
      ) : (
        recipePreferences.map((r, i) => (
        <div key={r.spoonacularId}>
          {r.title}: eat{" "}
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
          />{" "}
          times
        </div>
        ))
      )}
      <button onClick={handleGenerate}>generate meal plan</button>
      {message && <p>{message}</p>}
    </div>
  );
}
