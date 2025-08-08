import { useNavigate } from "react-router-dom";
import { useIngredients } from "../context/IngredientContext.tsx";
import "../styles/fridge.css";

const pantryItems = [
  { name: "salt", src: "/salt.png", className: "salt" },
  { name: "pepper", src: "/pepper.png", className: "pepper" },
  { name: "flour", src: "/flour.png", className: "flour" },
  { name: "sugar", src: "/sugar.png", className: "sugar" },
  { name: "oil", src: "/oil.png", className: "oil" }
];

const PantryView = () => {
  const navigate = useNavigate();
  const { selected, addIngredient, removeIngredient } = useIngredients();
  const toggleIngredient = (ingredient: string) => {
    if (selected.includes(ingredient)) {
      removeIngredient(ingredient);
    } else {
      addIngredient(ingredient);
    }
  };

  return (
    <div className="ingredient-view-container">
      <div className="fridge">
        <button className="back-button" onClick={() => navigate("/kitchen")}>
          ← Back
        </button>
        <img src="/pantry.png" alt="pantry" className="full-image" />
        {pantryItems.map((item, index) => (
          <button
            key={index}
            className={`ingredient ${item.className}`}
            onClick={() => toggleIngredient(item.name)}
          >
            <img src={item.src} alt={item.name} />
          </button>
        ))}
      </div>
      <div className="selected-ingredients-area">
        <h3>Selected</h3>
        <div className="selected-grid">
          {selected.map((item) => (
            <img
              key={item}
              src={`/${item}.png`}
              alt={item}
              className="selected-ingredients"
              onClick={() => removeIngredient(item)}
            />
          ))}
        </div>
        <button
          className="fridge-button"
          onClick={() => navigate("/fridge-view")}
        >
          Fridge
        </button>
        <button className="recipe-button" onClick={() => navigate("/recipes")}>
          Generate Recipe
        </button>
      </div>
    </div>
  );
};
export default PantryView;
