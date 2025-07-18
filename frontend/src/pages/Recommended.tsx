import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import { likeNSaveRecipes } from "../hooks/likeNSaveRecipes";

const Reccomended = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const {
    savedIds,
    likeIds,
    handleSave,
    handleUnsave,
    handleLike,
    handleUnlike,
  } = likeNSaveRecipes();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch("http://localhost:4000/recipes/recommended", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("failed to fetch recommended recipes");
        const data = await res.json();
        setRecipes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) return <p>loading suggestions...</p>;
  if (error) return <p>error: {error}</p>;
  if (recipes.length === 0) return <p>no recommended recipes found</p>;

  return (
    <div className="container">
      <button className="back" onClick={() => navigate(-1)}>
        back
      </button>
      <h3>recommended for you</h3>
      {loading ? (
        <p>loading...</p>
      ) : error ? (
        <p>error: {error}</p>
      ) : recipes.length === 0 ? (
        <p>no recommendations found</p>
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe) => {
            const isSaved = savedIds.has(recipe.id.toString());
            const isLiked = likeIds.has(recipe.id.toString());
            return (
              <div key={recipe.id} className="recipe-wrapper">
                <RecipeCard
                  recipe={recipe}
                  isSaved={isSaved}
                  isLiked={isLiked}
                  onSave={() => handleSave(recipe)}
                  onUnsave={() => handleUnsave(recipe.id.toString())}
                  onLike={() => handleLike(recipe)}
                  onUnlike={() => handleUnlike(recipe.id.toString())}
                  showNutrition={false}
                  showIngredientMatch={false}
                />
                {typeof recipe.score === "number" && (
                  <p>match score: {recipe.score}%</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reccomended;
