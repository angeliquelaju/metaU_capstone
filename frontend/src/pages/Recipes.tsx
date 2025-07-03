import React, { useEffect, useState } from "react";
import { useIngredients } from "../context/IngredientContext";
import { useNavigate } from "react-router-dom";

const Recipes = () => {
  const { selected } = useIngredients();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [count, setCount] = useState(8);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (selected.length === 0) return;
      setLoading(true);
      try {
        const apiKey = "c25d82b4400b4ec99e8dac172c6746d0";
        const query = selected.join(",");
        const res = await fetch(
          `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${query}&number=20&ranking=2&ignorePantry=false`
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
  }, [selected]);

  if (loading) return <p>Loading recipes</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="recipe-container">
      <h2>Recipes Based on Ingredients Selected</h2>
      <div className="recipe-grid">
        {recipes
          .filter((recipe: any) => recipe.missedIngredients.length <= 5)
          .slice(0, count)
          .map((recipe: any) => (
            <div key={recipe.id} className="recipe-card">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="recipe-image"
              />
              <h3 className="recipe-title">{recipe.title}</h3>
              {recipe.missedIngredients.length > 0 ? (
                <p className="missing-ingredients">
                  Missing:{" "}
                  {recipe.missedIngredients
                    .map((item: any) => item.name)
                    .join(", ")}
                </p>
              ) : (
                <p className="missing-ingredients">
                  You have all the ingredients!
                </p>
              )}
              <button
                className="view-button"
                onClick={() => navigate(`/recipes/${recipe.id}`)}
              >
                View Recipe
              </button>
            </div>
          ))}
          {count < recipes.length && (
            <div className="more-recipes-container">
                <button className="more-recipes-button" onClick={() => setCount(count + 8)}>
                    More Recipes
                </button>
            </div>
          )}
      </div>
    </div>
  );
};
export default Recipes;
