import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FriendSuggestion from "../components/FriendSuggestion";
import RecipeCard from "../components/RecipeCard";
import { likeNSaveRecipes } from "../hooks/likeNSaveRecipes";

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
    await fetch("http://localhost:4000/logout", {
      credentials: "include",
    });
    setUser(null);
  };

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await fetch("http://localhost:4000/recipes/user", {
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
      <h2>welcome, {user}</h2>
      <button onClick={handleLogout}>log out</button>
      <h3>saved recipes</h3>
      {loading ? (
        <p>loading saved recipes...</p>
      ) : error ? (
        <p>error: {error}</p>
      ) : saved.length === 0 ? (
        <p>no recipes have been saved</p>
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
      <button
          onClick={() => navigate("/recommended")}
        >recommended recipes</button>
      <FriendSuggestion />
    </div>
  );
}
export default Profile;
