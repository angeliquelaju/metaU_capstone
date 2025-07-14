import React, { useEffect, useState } from "react";
import { useIngredients } from "../context/IngredientContext";
import RecipeCard from "../components/RecipeCard";
import FilterModal from "../components/FilterModal";

const Recipes = () => {
  const { selected } = useIngredients(); //selected ingredients from the kichen page

  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [count, setCount] = useState(8); //for loading more recipes
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [likeIds, setLikeIDs] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    maxReadyTime: "",
    minProtein: "",
    maxProtein: "",
    minCarbs: "",
    maxCarbs: "",
    minCalories: "",
    maxCalories: "",
  });
  const MAX_MISSING_INGREDIENTS = 5;

  //fetching recipes users have saved to show up on their profile
  const fetchSaved = async () => {
    try {
      const res = await fetch("http://localhost:4000/recipes/user", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("failed to get saved recipes");
      const data = await res.json();
      const savedSet: Set<string> = new Set(
        data.map((r: any) => r.id.toString()),
      );
      setSavedIds(savedSet);
    } catch (err) {
      console.error("failed to load saved recipes", err);
    }
  };

  //fetching recipes users have liked for personalized page
  const fetchLiked = async () => {
    try {
      const res = await fetch("http://localhost:4000/recipes/likedRecipes", {
        credentials: "include",
      });
      const data = await res.json();
      const likedSet: Set<string> = new Set(
        data.map((r: any) => r.id.toString()),
      );
      setLikeIDs(likedSet);
    } catch (err) {
      console.error("failed to fetch liked recipes", err);
    }
  };

  //fetch recipe list (default before filters)
  const fetchByIngredients = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      const apiKey = "a2b10d0858114401869726f80933ad86";
      const query = selected.join(",");
      const res = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${query}&number=25&ranking=2&ignorePantry=false`,
      );
      if (!res.ok) throw new Error("failed to fetch recipes");
      const data = await res.json();
      setRecipes(data);
      fetchSaved();
      fetchLiked();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchByIngredients();
  }, [selected]);

  const applyFilters = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const apiKey = "a2b10d0858114401869726f80933ad86";
      params.append("apiKey", apiKey);
      params.append("ranking", "2");
      params.append("number", "25");
      params.append("addRecipeNutrition", "true");
      params.append("includeIngredients", selected.join(","));

      Object.entries(filters).forEach(([key, value]) => {
        if (value.trim()) {
          params.append(key, value.trim());
        }
      });
      const res = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`,
      );
      if (!res.ok) throw new Error("failed to apply filters");
      const data = await res.json();
      setRecipes(data.results || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        },
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
        },
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

  if (!loading && selected.length === 0) {
    return <p>please go to the Kitchen page and select ingredients</p>;
  }
  if (loading) return <p>loading recipes</p>;
  if (error) return <p>error: {error}</p>;

  return (
    <div className="recipe-container">
      <h2>Recipes Based on Ingredients Selected</h2>

      <button onClick={() => setShowModal(true)}>filter</button>
      {showModal && (
        <FilterModal
          filters={filters}
          setFilters={setFilters}
          onClose={() => setShowModal(false)}
          onApply={() => {
            applyFilters();
            setShowModal(false);
          }}
        />
      )}

      <div className="recipe-grid">
        {recipes
          .filter(
            (recipe: any) =>
              !recipe.missedIngredients ||
              recipe.missedIngredients.length <= MAX_MISSING_INGREDIENTS,
          )
          .slice(0, count)
          .map((recipe: any) => {
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
              />
            );
          })}
        {count < recipes.length && (
          <div className="more-recipes-container">
            <button
              className="more-recipes-button"
              onClick={() => setCount(count + 8)}
            >
              More Recipes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default Recipes;
