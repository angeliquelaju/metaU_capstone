import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { likeNSaveRecipes } from "../hooks/likeNSaveRecipes";
import FriendSuggestion from "../components/FriendSuggestion";
import RecipeCard from "../components/RecipeCard";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/profile.css";
const backendURL = import.meta.env.VITE_BACKEND_URL;

function Profile({
  user,
  setUser,
}: {
  user: string;
  setUser: (u: string | null) => void;
}) {
  const {
    savedIds,
    likeIds,
    handleSave,
    handleUnsave,
    handleLike,
    handleUnlike,
  } = likeNSaveRecipes();

  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch(`${backendURL}/logout`, {
      credentials: "include",
    });
    setUser(null);
  };

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await fetch(`${backendURL}/recipes/user`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("failed to fetch current user data");
        const data = await res.json();
        setSaved(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  return (
    <div className="container">
      <h2>Welcome, {user}</h2>
      <div className="logout">
        <button className="logout-button" onClick={handleLogout}>Log Out</button>
      </div>
      <h3 className = "saved-recipes">Saved Recipes</h3>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p>Error: {error}</p>
      ) : saved.length === 0 ? (
        <p>No recipes have been saved</p>
      ) : (
        <div className="recipe-grid">
          {saved.map((recipe) => {
            const isSaved = savedIds.has(recipe.id.toString());
            const isLiked = likeIds.has(recipe.id.toString());
            return (
              <RecipeCard
                key={recipe.id}
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
            );
          })}
        </div>
      )}
      <FriendSuggestion />
      <button
          className = "recs-button"
          onClick={() => navigate("/recommended")}
        >Recommendations based on suggested users</button>
    </div>
  );
}
export default Profile;
