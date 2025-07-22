import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { likeNSaveRecipes } from "../hooks/likeNSaveRecipes";
import RecipeCard from "../components/RecipeCard";
const backendURL = import.meta.env.VITE_BACKEND_URL;

type Recipe = {
  id: number;
  title: string;
  image: string;
};

const Personalized = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
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
    const fetchPersonalized = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backendURL}/recipes/personalized`, {
          credentials: "include",
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(
            errData.error || "failed to fetch personalized recipes"
          );
        }

        const data = await res.json();
        setRecipes(data);
      } catch (err: any) {
        if (err.message === "please log in") {
          setError("please log in to see personalized recipes");
        } else {
          setError("something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPersonalized();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <p>error: {error}</p>;
  if (error === "please log in to see personalized recipes")
    return <p>{error}</p>;

  return (
    <div className="recipe-container">
      <h2>recommended for you</h2>
      <div className="recipe-grid">
        {recipes.length === 0 ? (
          <p>no recs available</p>
        ) : (
          recipes.map((recipe: any) => {
            const isSaved = savedIds.has(recipe.id.toString());
            const isLiked = likeIds.has(recipe.id.toString());
            const showNutrition = !!recipe.nutrition;
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
                showNutrition={showNutrition}
                showIngredientMatch={false}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default Personalized;
