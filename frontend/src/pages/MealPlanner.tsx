import LoadingSpinner from "../components/LoadingSpinner";
import { mealPlanData } from "../hooks/mealPlanData";
import CalendarView from "../components/CalendarView";
import GoalInput from "../components/GoalInput";
import MakeMealPlan from "../components/MakeMealPlan";
import PlanHistory from "../components/PlanHistory";

export default function MealPlanner() {
  const {
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
  } = mealPlanData();

  if (loading) return <LoadingSpinner />;
  if (message === "please log in to use the meal planner")
    return <p>{message}</p>;

  return (
    <div>
      <h2>meal planner</h2>
      {plan && !showPlanner ? (
        <CalendarView
          plan={plan}
          nutrition={nutrition}
          goals={goals}
          setGoals={setGoals}
          setShowPlanner={setShowPlanner}
        />
      ) : (
        planHistory.length > 0 && (
          <>
            <GoalInput goals={goals} setGoals={setGoals} />
            <PlanHistory
              planHistory={planHistory}
              savedRecipes={savedRecipes}
              setMealCounts={setMealCounts}
              setRecipePreferences={setRecipePreferences}
            />
            <MakeMealPlan
              mealCounts={mealCounts}
              setMealCounts={setMealCounts}
              recipePreferences={recipePreferences}
              setRecipePreferences={setRecipePreferences}
              handleGenerate={handleGenerate}
              savedRecipes={savedRecipes}
            />
            {message && <p>{message}</p>}
          </>
        )
      )}
    </div>
  );
}
