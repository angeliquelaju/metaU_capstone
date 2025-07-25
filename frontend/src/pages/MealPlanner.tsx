import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
const backendURL = import.meta.env.VITE_BACKEND_URL;
const SPOON_KEY = import.meta.env.VITE_SPOON_KEY!;

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
  const [planHistory, setPlanHistory] = useState<any[]>([]);
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
  const [adjusted, setAdjusted] = useState(false);
  //cache nutrition data for recipes
  const [nutritionCache, setNutritionCache] = useState<
    Map<Number, { calories: number; protein: number; carbs: number }>
  >(new Map());
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
        const [recipesRes, planRes, goalsRes, historyRes] = await Promise.all([
          fetch(`${backendURL}/recipes/user`, {
            credentials: "include",
          }),
          fetch(`${backendURL}/meal-plan`, {
            credentials: "include",
          }),
          fetch(`${backendURL}/user/goals`, {
            credentials: "include",
          }),
          fetch(`${backendURL}/meal-plan/history`, {
            credentials: "include",
          }),
        ]);

        const [recipes, goalsData, historyData] = await Promise.all([
          recipesRes.json(),
          goalsRes.json(),
          historyRes.json(),
        ]);

        setSavedRecipes(recipes);
        setGoals(goalsData);
        setPlanHistory(historyData);
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
      } catch (error: any) {
        console.error("error loading saved recipes or plan: ", error);
        if (
          error.response?.status === 401 ||
          error.message?.includes("please log in")
        ) {
          setMessage("please log in to use the meal planner");
        }
        setPlan(null);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleGenerate = async () => {
    const totalMeals = Object.values(mealCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    const updatedPreference = [...recipePreferences];

    //creating a nutrition map, trying to cache
    const nutritionMap: Map<
      number,
      { calories: number; protein: number; carbs: number }
    > = new Map();

    //fetch nutrition info, but use cache first if its possible
    await Promise.all(
      updatedPreference.map(async (r) => {
        const cached = nutritionCache.get(r.spoonacularId);
        if (cached) {
          nutritionMap.set(r.spoonacularId, cached);
          return;
        }
        const res = await fetch(
          `https://api.spoonacular.com/recipes/${r.spoonacularId}/nutritionWidget.json?apiKey=${SPOON_KEY}`
        );
        const data = await res.json();
        const parsed = {
          calories: parseInt(data.calories),
          protein: parseFloat(data.protein.replace("g", "")),
          carbs: parseFloat(data.carbs.replace("g", "")),
        };
        nutritionMap.set(r.spoonacularId, parsed);
        setNutritionCache((prev) => new Map(prev).set(r.spoonacularId, parsed));
      })
    );

    //calculating total nutrition
    const totalNutrition = { calories: 0, protein: 0, carbs: 0 };
    let totalRecipes = 0;

    for (const recipe of updatedPreference) {
      const n = nutritionMap.get(recipe.spoonacularId);
      if (!n) continue;
      totalNutrition.calories += n.calories * recipe.servings;
      totalNutrition.protein += n.protein * recipe.servings;
      totalNutrition.carbs += n.carbs * recipe.servings;
      totalRecipes += recipe.servings;
    }

    let autoAdjust = false;
    const diff = (goal: number, actual: number) => goal - actual;

    //adding servings until recipe and meals are balanced towards meeting the nutrition goals
    while (
      totalRecipes < totalMeals ||
      totalNutrition.calories < goals.calories ||
      totalNutrition.protein < goals.protein ||
      totalNutrition.carbs < goals.carbs
    ) {
      //get recipes that have nutrition info
      const recipes = updatedPreference.filter((r) =>
        nutritionMap.has(r.spoonacularId)
      ); 

      if (recipes.length === 0) break;
      let best = recipes[0]; //initialize with first recipe
      let bestNutrition = nutritionMap.get(best.spoonacularId)!;
      //calculate how much this recipe help lessen the gap between current total and user goal
      let bestScore =
        diff(goals.calories, totalNutrition.calories) * bestNutrition.calories +
        diff(goals.protein, totalNutrition.protein) * bestNutrition.protein +
        diff(goals.carbs, totalNutrition.carbs) * bestNutrition.carbs;

      //loop through other recipes in the map to find the one with the highest score
      for (let i = 1; i < recipes.length; i++) {
        const recipe = recipes[i];
        const n = nutritionMap.get(recipe.spoonacularId)!;
        const score =
          diff(goals.calories, totalNutrition.calories) * n.calories +
          diff(goals.protein, totalNutrition.protein) * n.protein +
          diff(goals.carbs, totalNutrition.carbs) * n.carbs;

        if (score > bestScore) {
          best = recipe;
          bestNutrition = n;
          bestScore = score;
        }
      }

      //increase serving and macros of best recipe
      best.servings++;
      totalNutrition.calories += bestNutrition.calories;
      totalNutrition.protein += bestNutrition.protein;
      totalNutrition.carbs += bestNutrition.carbs;
      totalRecipes++;
      autoAdjust = true;
    }

    //removing servings until serving reached or reduce macro total
    while (
      totalRecipes > totalMeals ||
      totalNutrition.calories > goals.calories * 1.1 ||
      totalNutrition.protein > goals.protein * 1.1 ||
      totalNutrition.carbs > goals.carbs * 1.1
    ) {
      //only look at recipes that have more than 0 serving and has nutrition info
      const recipes = updatedPreference.filter(
        (r) => r.servings > 0 && nutritionMap.has(r.spoonacularId)
      );

      if (recipes.length === 0) break;
      let worst = recipes[0];
      let worstNutrition = nutritionMap.get(worst.spoonacularId)!;
      //calculate how much this recipe effect the excess macros
      let worstExcess =
        Math.max(0, totalNutrition.calories - goals.calories) *
          worstNutrition.calories +
        Math.max(0, totalNutrition.protein - goals.protein) *
          worstNutrition.protein +
        Math.max(0, totalNutrition.carbs - goals.carbs) * worstNutrition.carbs;

      //loop through other recipes in the map to find the one with the highest score (worst recipe)
      for (let i = 1; i < recipes.length; i++) {
        const recipe = recipes[i];
        const n = nutritionMap.get(recipe.spoonacularId)!;
        const excess =
          Math.max(0, totalNutrition.calories - goals.calories) * n.calories +
          Math.max(0, totalNutrition.protein - goals.protein) * n.protein +
          Math.max(0, totalNutrition.carbs - goals.carbs) * n.carbs;

        if (excess > worstExcess) {
          worst = recipe;
          worstNutrition = n;
          worstExcess = excess;
        }
      }

      //subtract the serving and macros of that recipe
      worst.servings--;
      totalNutrition.calories -= worstNutrition.calories;
      totalNutrition.protein -= worstNutrition.protein;
      totalNutrition.carbs -= worstNutrition.carbs;
      totalRecipes--;
      autoAdjust = true;
    }

    //if meal count is still less than totalMeals, adds serving to the one with the lowest servings
    let finalTotal = updatedPreference.reduce((sum, r) => sum + r.servings, 0);

    while (finalTotal < totalMeals) {
      const recipe = updatedPreference.reduce((min, curr) =>
        curr.servings < min.servings ? curr : min
      );
      recipe.servings++;
      finalTotal++;
    }

    if (autoAdjust && !adjusted) {
      setRecipePreferences(updatedPreference);
      setAdjusted(true);
      setMessage(
        `adjusted recipe servings automatically to match ${totalMeals} meals and nutrition goals`
      );
      return;
    }
    const res = await fetch(`${backendURL}/generate-plan`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipePreferences: updatedPreference,
        dailyMeals: mealCounts,
      }),
    });

    if (res.ok) {
      setMessage("meal plan generated");
      setAdjusted(false);
      navigate("/grocery");
    } else {
      setMessage("failed to generate");
    }
  };

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

  if (loading) return <LoadingSpinner />;
  if (message === "please log in to use the meal planner")
    return <p>{message}</p>;

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
                {goals.calories}
                {nutrition.weekly.calories >= goals.calories
                  ? " yes ✅"
                  : " no ❌"}
              </p>
              <p>
                protein: {Math.round(nutrition.weekly.protein)} /{" "}
                {goals.protein}
                {nutrition.weekly.protein >= goals.protein
                  ? " yes ✅"
                  : " no ❌"}
              </p>
              <p>
                carbs: {Math.round(nutrition.weekly.carbs)} / {goals.carbs}
                {nutrition.weekly.carbs >= goals.carbs ? " yes ✅" : " no ❌"}
              </p>
              <h4>set weekly goals:</h4>
              calories:
              <input
                type="number"
                value={goals.calories}
                onChange={(e) =>
                  setGoals({ ...goals, calories: +e.target.value })
                }
                placeholder="weekly calories"
              />
              protein:
              <input
                type="number"
                value={goals.protein}
                onChange={(e) =>
                  setGoals({ ...goals, protein: +e.target.value })
                }
                placeholder="weekly protein"
              />
              carbs:
              <input
                type="number"
                value={goals.carbs}
                onChange={(e) => setGoals({ ...goals, carbs: +e.target.value })}
                placeholder="weekly carbs"
              />
              <button
                className="saveGoals-button"
                onClick={async () => {
                  await fetch(`${backendURL}/user/goals`, {
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
                      {meal.title}
                      {meal.servings > 1 ? `(x${meal.servings})` : ""}
                    </div>
                  ))
                ) : (
                  <p className="empty-day">no meals</p>
                )}
                {nutrition?.daily?.[dayPlan.day] && (
                  <small>
                    {Math.round(nutrition.daily[dayPlan.day].calories)} kcal,
                    {Math.round(nutrition.daily[dayPlan.day].protein)} g
                    protein,
                    {Math.round(nutrition.daily[dayPlan.day].carbs)} g carbs
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
          {planHistory.length > 0 && (
            <>
              <div className="nutrition-overview">
                <h4>set weekly goals:</h4>
                <input
                  type="number"
                  value={goals.calories}
                  onChange={(e) =>
                    setGoals({ ...goals, calories: +e.target.value })
                  }
                  placeholder="weekly calories"
                />
                kcal
                <input
                  type="number"
                  value={goals.protein}
                  onChange={(e) =>
                    setGoals({ ...goals, protein: +e.target.value })
                  }
                  placeholder="weekly protein"
                />
                g
                <input
                  type="number"
                  value={goals.carbs}
                  onChange={(e) =>
                    setGoals({ ...goals, carbs: +e.target.value })
                  }
                  placeholder="weekly carbs"
                />
                g
                <button
                  className="saveGoals-button"
                  onClick={async () => {
                    await fetch(`${backendURL}/user/goals`, {
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
          )}
          <h3>meals per day</h3>
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

          <h3>recipe preferences</h3>
          {recipePreferences.length === 0 ? (
            <p>no saved recipes</p>
          ) : (
            recipePreferences.map((r, i) => (
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
          <button onClick={handleGenerate}>generate meal plan</button>
          {message && <p>{message}</p>}
        </>
      )}
    </div>
  );
}
