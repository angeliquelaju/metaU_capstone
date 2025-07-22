import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
const SPOON_KEY = import.meta.env.VITE_SPOON_KEY!;

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch(
          `https://api.spoonacular.com/recipes/${id}/information?apiKey=${SPOON_KEY}&includeNutrition=true`,
        );
        if (!res.ok) throw new Error("failed to fetch recipes");
        const data = await res.json();
        setRecipe(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <p>Error: {error}</p>;
  if (!recipe) return null;

  return (
    <div className="recipe-details-container">
      <button className="back" onClick={() => navigate(-1)}>
        Back
      </button>
      <h1>{recipe.title}</h1>
      <img src={recipe.image} alt={recipe.title} />
      <p>
        <strong>Servings:</strong> {recipe.servings} people
      </p>
      <p>
        <strong>Ready in:</strong> {recipe.readyInMinutes} minutes
      </p>

      <h2>Ingredients</h2>
      <ul>
        {recipe.extendedIngredients.map((ingredient: any) => (
          <li key={ingredient.id}>{ingredient.original}</li>
        ))}
      </ul>

      <h2>Instructions</h2>
      <p>{recipe.instructions || "No instructions provided"}</p>

      <h2>Other Information</h2>
      <h4>Nutrition</h4>
      <ul>
        {recipe.nutrition?.nutrients?.map((nutrient: any) => (
          <li key={nutrient.name}>
            {nutrient.name}: {nutrient.amount}
            {nutrient.unit}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default RecipeDetail;
