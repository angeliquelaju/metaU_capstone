import { useEffect, useState } from "react";
import { useIngredients } from "../context/IngredientContext";
import RecipeCard from "../components/RecipeCard";
import FilterModal from "../components/FilterModal";
const SPOON_KEY = import.meta.env.VITE_SPOON_KEY!;
import { likeNSaveRecipes } from "../hooks/likeNSaveRecipes";

const Recipes = () => {
  const { selected } = useIngredients(); //selected ingredients from the kichen page

  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [count, setCount] = useState(8); //for loading more recipes
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

  const {
    savedIds,
    likeIds,
    handleSave,
    handleUnsave,
    handleLike,
    handleUnlike,
  } = likeNSaveRecipes();

  const MAX_MISSING_INGREDIENTS = 5;

  //fetch recipe list (default before filters)
  const fetchByIngredients = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      const query = selected.join(",");
      const res = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${SPOON_KEY}&ingredients=${query}&number=25&ranking=2&ignorePantry=false`,
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

  useEffect(() => {
    fetchByIngredients();
  }, [selected]);

  const applyFilters = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("apiKey", `${SPOON_KEY}`);
      params.append("ranking", "2"); //prioritizes minimizing missing ingredients first
      params.append("number", "25"); //maximum number of recipes to return
      params.append("addRecipeNutrition", "true");
      params.append("includeIngredients", selected.join(","));
      params.append("instructionsRequired", "true");

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
                showIngredientMatch={true}
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
