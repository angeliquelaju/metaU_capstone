import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getNutritionDiff,
    getExcess,
} from "../utils/nutritionCalcs";
const backendURL = import.meta.env.VITE_BACKEND_URL;

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function mealPlanData() {
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
        const res = await fetch(`${backendURL}/nutrition/${r.spoonacularId}`, {
          credentials: "include",
        });
        const data = await res.json();
        nutritionMap.set(r.spoonacularId, data);
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

    //adding servings until recipe and meals are balanced towards meeting the nutrition goals
    while ( totalRecipes < totalMeals ) {
      //get recipes that have nutrition info
      const recipes = updatedPreference.filter((r) =>
        nutritionMap.has(r.spoonacularId)
      );

      let best = recipes[0]; //initialize with first recipe
      let bestNutrition = nutritionMap.get(best.spoonacularId)!;
      //calculate how much this recipe help lessen the gap between current total and user goal
      let bestScore = getNutritionDiff(goals, totalNutrition, bestNutrition);

      //loop through other recipes in the map to find the one with the highest score
      for (let i = 1; i < recipes.length; i++) {
        const recipe = recipes[i];
        const n = nutritionMap.get(recipe.spoonacularId)!;
        const score = getNutritionDiff(goals, totalNutrition, n)

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
    while ( totalRecipes > totalMeals ) {
      //only look at recipes that have more than 0 serving and has nutrition info
      const recipes = updatedPreference.filter(
        (r) => r.servings > 0 && nutritionMap.has(r.spoonacularId)
      );

      let worst = recipes[0];
      let worstNutrition = nutritionMap.get(worst.spoonacularId)!;
      //calculate how much this recipe effect the excess macros
      let worstExcess = getExcess(goals, totalNutrition, worstNutrition);
      
      //loop through other recipes in the map to find the one with the highest score (worst recipe)
      for (let i = 1; i < recipes.length; i++) {
        const recipe = recipes[i];
        const n = nutritionMap.get(recipe.spoonacularId)!;
        const excess = getExcess(goals, totalNutrition, n);

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


  return {
    plan,
    showPlanner,
    setShowPlanner,
    planHistory, 
    savedRecipes,
    recipePreferences,
    setRecipePreferences,
    mealCounts,
    setMealCounts,
    goals,
    setGoals,
    nutrition,
    loading,
    message, 
    handleGenerate, 
  };
}