import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import { FcLike } from "react-icons/fc";
import { FaRegHeart } from "react-icons/fa6";

type Props = {
  recipe: any;
  isSaved: boolean;
  isLiked: boolean;
  onSave: () => void;
  onUnsave: () => void;
  onLike: () => void;
  onUnlike: () => void;
  showNutrition: boolean;
  showIngredientMatch: boolean;
};

const RecipeCard: React.FC<Props> = ({
  recipe,
  isSaved,
  isLiked,
  onSave,
  onUnsave,
  onLike,
  onUnlike,
  showNutrition,
  showIngredientMatch,
}) => {
  const navigate = useNavigate();
  const displayValues: string[] = [];
  if (showNutrition) {
    if (recipe.readyInMinutes)
      displayValues.push(`${recipe.readyInMinutes} min`);
    if (recipe.nutrition) {
      const nutrients = recipe.nutrition.nutrients || [];
      const get = (name: string) =>
        nutrients.find((n: any) => n.name === name)?.amount;
      if (get("Calories")) displayValues.push(`${get("Calories")} cal`);
      if (get("Protein")) displayValues.push(`${get("Protein")}g protein`);
      if (get("Carbohydrates"))
        displayValues.push(`${get("Carbohydrates")}g carbs`);
    }
  }

  return (
    <div className="recipe-card">
      <img src={recipe.image} alt={recipe.title} className="recipe-image" />
      <h3 className="recipe-title">{recipe.title}</h3>

      {showNutrition ? (
        <p>{displayValues.join(" • ")}</p>
      ) : showIngredientMatch ? (
        recipe.missedIngredients?.length > 0 ? (
          <p className="missing-ingredients">
            Missing: 
            {recipe.missedIngredients.map((i: any) => i.name).join(", ")}
          </p>
        ) : (
          <p className="missing-ingredients">you have all the ingredients</p>
        )
      ) : null}

      <button
        className="view-button"
        onClick={() => navigate(`/recipes/${recipe.id}`)}
      >
        view recipe
      </button>
      {isSaved ? (
        <button className="unsave-button" onClick={onUnsave}>
          <FaBookmark />
        </button>
      ) : (
        <button className="save-button" onClick={onSave}>
          <FaRegBookmark />
        </button>
      )}

      {isLiked ? (
        <button className="unlike-button" onClick={onUnlike}>
          <FcLike />
        </button>
      ) : (
        <button className="like-button" onClick={onLike}>
          <FaRegHeart />
        </button>
      )}
    </div>
  );
};
export default RecipeCard;
