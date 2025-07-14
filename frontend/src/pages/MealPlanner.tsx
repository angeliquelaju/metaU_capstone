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
  const [plan, setPlan] = useState<any | null>(null);
  const [showPlanner, setShowPlanner] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<
    { id: string; title: string }[]
  >([]);

  const [mealCounts, setMealCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(DAYS.map((d) => [d, 3]))
  );

  const [recipePreferences, setRecipePreferences] = useState<
    { title: string; spoonacularId: number; servings: number }[]
  >([]);

  const [nutrition, setNutrition] = useState<any | null>(null);
  const [goals, setGoals] = useState({
    calories: 2000,
    protein: 200,
    carbs: 100,
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [recipesRes, planRes, goalsRes] = await Promise.all([
          fetch("http://localhost:4000/recipes/user", {
            credentials: "include",
          }),
          fetch("http://localhost:4000/meal-plan", {
            credentials: "include",
          }),
          fetch("http://localhost:4000/user/goals", {
            credentials: "include",
          }),
        ]);
        const recipes = await recipesRes.json();
        const goalsData = await goalsRes.json();
        setSavedRecipes(recipes);
        setGoals(goalsData);
        setRecipePreferences(
          recipes.map((r: any) => ({
            title: r.title,
            spoonacularId: parseInt(r.id),
            servings: 1,
          }))
        );
        if (planRes.ok) {
          const planData = await planRes.json();
          setPlan(planData.plan);
          setNutrition(planData.nutrition);
        } else {
          setPlan(null);
        }
        setLoading(false);
      } catch (error) {
        console.error("error loading saved recipes or plan: ", error);
        setPlan(null);
        setLoading(false);
      }
    };
    loadData();
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

  if (loading) return <p>loading saved recipes...</p>;

  return (
    <div>
      <h2>meal planner</h2>
      {plan && !showPlanner ? (
        <>
          {nutrition && (
            <div className="nutrition-overview">
              <h3>weekly nutrition</h3>
              <p>
                calories: {Math.round(nutrition.weekly.calories)} /{" "}
                {goals.calories}{" "}
                {nutrition.weekly.calories >= goals.calories
                  ? "yes ✅"
                  : " no ❌"}
              </p>
              <p>
                protein: {Math.round(nutrition.weekly.protein)} /{" "}
                {goals.protein}{" "}
                {nutrition.weekly.protein >= goals.protein
                  ? "yes ✅"
                  : " no ❌"}
              </p>
              <p>
                carbs: {Math.round(nutrition.weekly.carbs)} / {goals.carbs}{" "}
                {nutrition.weekly.carbs >= goals.carbs ? "yes ✅" : " no ❌"}
              </p>
              <h4>set weekly goals:</h4>
              <input
                type="number"
                value={goals.calories}
                onChange={(e) =>
                  setGoals({ ...goals, calories: +e.target.value })
                }
                placeholder="weekly calories"
              />{" "}
              kcal
              <input
                type="number"
                value={goals.protein}
                onChange={(e) =>
                  setGoals({ ...goals, protein: +e.target.value })
                }
                placeholder="weekly protein"
              />{" "}
              g
              <input
                type="number"
                value={goals.carbs}
                onChange={(e) => setGoals({ ...goals, carbs: +e.target.value })}
                placeholder="weekly carbs"
              />{" "}
              g
              <button className="saveGoals-button"
                onClick={async () => {
                  await fetch("http://localhost:4000/user/goals", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(goals),
                  });
                }}
              >
                save goals
              </button>
            </div>
          )}

          <div className="calendar">
            {plan.map((dayPlan: any) => (
              <div key={dayPlan.day} className="calendar-day">
                <h3>{dayPlan.day}</h3>
                {dayPlan.meals.length > 0 ? (
                  dayPlan.meals.map((meal: any, idx: number) => (
                    <div
                      key={`${meal.spoonacularId}-${idx}`}
                      className="calendar-meal"
                      onClick={() => navigate(`/recipes/${meal.spoonacularId}`)}
                    >
                      {meal.title}{" "}
                      {meal.servings > 1 ? `(x${meal.servings})` : ""}
                    </div>
                  ))
                ) : (
                  <p className="empty-day">no meals</p>
                )}
                {nutrition?.daily?.[dayPlan.day] && (
                  <small>
                    {Math.round(nutrition.daily[dayPlan.day].calories)} kcal,{" "}
                    {Math.round(nutrition.daily[dayPlan.day].protein)} g
                    protein, {Math.round(nutrition.daily[dayPlan.day].carbs)} g
                    carbs
                  </small>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => setShowPlanner(true)}>
            generate new plan
          </button>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
