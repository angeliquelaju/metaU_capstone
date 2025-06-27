import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const apiKey = "c25d82b4400b4ec99e8dac172c6746d0";
        const res = await fetch(
          `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`
        );
        if (!res.ok) throw new Error("failed to fetch recipes");
        const data = await res.json();
        setRecipes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [id]);

  if (loading) return <p>Loading recipes</p>;
  if (error) return <p>Error: {error}</p>;
  if (!recipe) return null;

  return (
    <div className="recipe-details-container">
        <button className = "back" onClick={() => navigate(-1)}>Back</button>
        <h1>{recipe.title}</h1>
        <img src={recipe.image} alt={recipe.title}/>
        <p><strong>Servings:</strong> {recipe.servings} people</p>
        <p><strong>Ready in:</strong> {recipe.readyInMinutes} minutes</p>

        <h2>Ingredients</h2>
        <ul>
            {recipe.extendedIngredients.map((ingredient: any) => (
                <li key={ingredient.id}>{ingredient.original}</li>
            ))}
        </ul>

        <h2>Instructions</h2>
        <p>{recipe.instructions || 'No instructions provided'}</p>
    </div>
  );
};
export default RecipeDetail;