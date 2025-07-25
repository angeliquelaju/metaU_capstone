import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { likeNSaveRecipes } from "../hooks/likeNSaveRecipes";
import RecipeCard from "../components/RecipeCard";
import LoadingSpinner from "../components/LoadingSpinner";
const backendURL = import.meta.env.VITE_BACKEND_URL;

const Recomended = () => {
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
        const res = await fetch(`${backendURL}/recipes/recommended`, {
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

  if (loading) return <LoadingSpinner />;
  if (error) return <p>error: {error}</p>;
  if (recipes.length === 0) return <p>no recommended recipes found</p>;

  return (
    <div className="container">
      <button className="back" onClick={() => navigate(-1)}>
        back
      </button>
      <h3>recommended for you based on user suggested</h3>
      {loading ? (
        <LoadingSpinner />
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

export default Recomended;
