import { useNavigate } from "react-router-dom";
import GoalInput from "./GoalInput";

export default function CalendarView({
  plan,
  nutrition,
  goals,
  setGoals,
  setShowPlanner,
}: any) {
  const navigate = useNavigate();
  return (
    <>
      {nutrition && (
        <div className="nutrition-overview">
          <h3>weekly nutrition</h3>
          <p>
            calories: {Math.round(nutrition.weekly.calories)} / {goals.calories}
            {nutrition.weekly.calories >= goals.calories ? " yes ✅" : " no ❌"}
          </p>
          <p>
            protein: {Math.round(nutrition.weekly.protein)} / {goals.protein}
            {nutrition.weekly.protein >= goals.protein ? " yes ✅" : " no ❌"}
          </p>
          <p>
            carbs: {Math.round(nutrition.weekly.carbs)} / {goals.carbs}
            {nutrition.weekly.carbs >= goals.carbs ? " yes ✅" : " no ❌"}
          </p>
          <GoalInput goals={goals} setGoals={setGoals} />
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
                {Math.round(nutrition.daily[dayPlan.day].protein)} g protein,
                {Math.round(nutrition.daily[dayPlan.day].carbs)} g carbs
              </small>
            )}
          </div>
        ))}
      </div>
      <button onClick={() => setShowPlanner(true)}>generate new plan</button>
    </>
  );
}
