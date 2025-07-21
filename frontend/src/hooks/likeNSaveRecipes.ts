import { useState, useEffect } from "react";
const backendURL = import.meta.env.VITE_BACKEND_URL;

export const likeNSaveRecipes = () => {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [likeIds, setLikeIDs] = useState<Set<string>>(new Set());
  useEffect(() => {
    const fetchSavedLiked = async () => {
      try {
        const [savedRes, likedRes] = await Promise.all([
          fetch(`${backendURL}/recipes/user`, {
            credentials: "include",
          }),
          fetch(`${backendURL}/recipes/likedRecipes`, {
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
    fetchSavedLiked();
  }, []);

  //saving a recipe to that specific user's list
  const handleSave = async (recipe: any) => {
    let ingredients: string[] = [];
    if (recipe.usedIngredients && recipe.missedIngredients) {
      ingredients = recipe.usedIngredients
        .concat(recipe.missedIngredients)
        .map((ing: any) => ing.name);
    } else if (recipe.ingredients) {
      ingredients = recipe.ingredients.map((ing: any) => ing.name || ing);
    }

    try {
      const res = await fetch(`${backendURL}/recipes/save`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: recipe.id.toString(),
          title: recipe.title,
          image: recipe.image,
          ingredients,
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
        `${backendURL}/remove/${recipeId}`,
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
    let ingredients: string[] = [];
    if (recipe.usedIngredients && recipe.missedIngredients) {
      ingredients = recipe.usedIngredients
        .concat(recipe.missedIngredients)
        .map((ing: any) => ing.name);
    } else if (recipe.ingredients) {
      ingredients = recipe.ingredients.map((ing: any) => ing.name || ing);
    }

    if (!ingredients.length) {
      console.warn("no ingredients found for recipe: ", recipe.id);
    }

    const res = await fetch(`${backendURL}/recipes/like`, {
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
        `${backendURL}/unlike/${recipeId}`,
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
  return {
    savedIds,
    likeIds,
    handleSave,
    handleUnsave,
    handleLike,
    handleUnlike,
  };
};
