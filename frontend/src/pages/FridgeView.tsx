import { useNavigate } from "react-router-dom";
import { useIngredients } from "../context/IngredientContext.tsx";

const fridgeItems = [
  { name: "chicken", src: "/public/chicken.png", className: "chicken" },
  { name: "tomato", src: "/public/tomato.png", className: "tomato" },
  { name: "onion", src: "/public/onion.png", className: "onion" },
  { name: "lemon", src: "/public/lemon.png", className: "lemon" },
];

const FridgeView = () => {
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
        <img src="/public/fridge.png" alt="fridge" className="full-image" />
        {fridgeItems.map((item, index) => (
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
              src={`/public/${item}.png`}
              alt={item}
              className="selected-ingredients"
              onClick={() => removeIngredient(item)}
            />
          ))}
        </div>
        <button
          className="pantry-button"
          onClick={() => navigate("/pantry-view")}
        >pantry</button>
        <button
          className="recipe-button"
          onClick={() => navigate("/recipes")}
        >generate recipe</button>
      </div>
    </div>
  );
};
export default FridgeView;
