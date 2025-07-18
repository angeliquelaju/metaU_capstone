import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import RecipeCard from "../components/RecipeCard";

const UserProfile = () => {
  const { username } = useParams();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [likeIds, setLikeIDs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserRecipes = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/recipes/user/${username}`
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

  useEffect(() => {
    const fetchCurrUserInfo = async () => {
      try {
        const [savedRes, likedRes] = await Promise.all([
          fetch("http://localhost:4000/recipes/user", {
            credentials: "include",
          }),
          fetch("http://localhost:4000/recipes/likedRecipes", {
            credentials: "include",
          }),
        ]);
        if (!savedRes.ok || !likedRes.ok)
          throw new Error("failed to fetch current user data");
        const savedData = await savedRes.json();
        const likedData = await likedRes.json();

        setSavedIds(new Set(savedData.map((r: any) => r.id.toString())));
        setLikeIDs(new Set(likedData.map((r: any) => r.id.toString())));
      } catch (err) {
        console.error("error fetching current user data", err);
      }
    };
    fetchCurrUserInfo();
  }, []);

  //saving a recipe to that specific user's list
  const handleSave = async (recipe: any) => {
    try {
      const res = await fetch("http://localhost:4000/recipes/save", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: recipe.id.toString(),
          title: recipe.title,
          image: recipe.image,
        }),
      });
      if (res.status === 200) {
        setSavedIds((prev) => new Set(prev).add(recipe.id.toString()));
      } else {
        const data = await res.json();
        alert(data.error || "failed to save recipe");
      }
    } catch (error) {
      alert("something went wrong while saving");
    }
  };

  //unsave recipes
  const handleUnsave = async (recipeId: string) => {
    try {
      const res = await fetch(
        `http://localhost:4000/recipes/remove/${recipeId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        setSavedIds((prev) => {
          const updated = new Set(prev);
          updated.delete(recipeId);
          return updated;
        });
      } else {
        const data = await res.json();
        alert(data.error || "failed to unsave");
      }
    } catch (err) {
      alert("error removing");
    }
  };

  //liking a recipe and sending their ingredients to the database
  const handleLike = async (recipe: any) => {
    const ingredients = recipe.usedIngredients
      .concat(recipe.missedIngredients)
      .map((ing: any) => ing.name);

    const res = await fetch("http://localhost:4000/recipes/like", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: recipe.id.toString(),
        title: recipe.title,
        image: recipe.image,
        ingredients,
      }),
    });
    if (res.ok) {
      setLikeIDs((prev) => new Set(prev).add(recipe.id.toString()));
    }
  };

  //unlike recipe
  const handleUnlike = async (recipeId: string) => {
    try {
      const res = await fetch(
        `http://localhost:4000/recipes/unlike/${recipeId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        setLikeIDs((prev) => {
          const updated = new Set(prev);
          updated.delete(recipeId);
          return updated;
        });
      } else {
        const data = await res.json();
        alert(data.error || "failed to unlike");
      }
    } catch (error) {
      alert("something went wrong while liking");
    }
  };

  return (
    <div className="container">
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
