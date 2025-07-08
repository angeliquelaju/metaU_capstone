import { useNavigate } from "react-router-dom";
import { useIngredients } from "../context/IngredientContext.tsx";

const fridgeItems = [
  { name: "chicken", src: "/src/assets/chicken.png", className: "chicken" },
  { name: "tomato", src: "/src/assets/tomato.png", className: "tomato" },
  { name: "onion", src: "/src/assets/onion.png", className: "onion" },
  { name: "lemon", src: "/src/assets/lemon.png", className: "lemon" },
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
        <img src="/src/assets/fridge.png" alt="fridge" className="full-image" />
        {fridgeItems.map((item, index) => (
          <button
            key={index}
            className={`fridge-item ${item.className}`}
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
              src={`/src/assets/${item}.png`}
              alt={item}
              className="selected-ingredients"
              onClick={() => removeIngredient(item)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
export default FridgeView;
