import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import RecipeCard from "../components/RecipeCard";
import { likeNSaveRecipes } from "../hooks/likeNSaveRecipes";

const UserProfile = () => {
  const { username } = useParams();
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
    const fetchUserRecipes = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/recipes/user/${username}`,
        );
        if (!res.ok) throw new Error("failed to load user recipes");
        const data = await res.json();
        setRecipes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserRecipes();
  }, [username]);

  return (
    <div className="container">
      <button className="back" onClick={() => navigate(-1)}>
        back
      </button>
      <h2>{username}'s saved recipes</h2>
      {loading ? (
        <p>loading...</p>
      ) : error ? (
        <p>error: {error}</p>
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe) => {
            const isSaved = savedIds.has(recipe.id.toString());
            const isLiked = likeIds.has(recipe.id.toString());
            return (
              <div key={recipe.id}>
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
                {isSaved && <p className="also-saved">also saved by you</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default UserProfile;
