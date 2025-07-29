const backendURL = import.meta.env.VITE_BACKEND_URL;

export default function GoalInput({ goals, setGoals }: any) {
  return (
    <>
      <h4>Set Weekly Goals:</h4>
      Calories:
      <input
        type="number"
        value={goals.calories}
        onChange={(e) => setGoals({ ...goals, calories: +e.target.value })}
        placeholder="weekly calories"
      />
      Protein:
      <input
        type="number"
        value={goals.protein}
        onChange={(e) => setGoals({ ...goals, protein: +e.target.value })}
        placeholder="weekly protein"
      />
      Carbohydrates:
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
        Save Goals
      </button>
    </>
  );
}
