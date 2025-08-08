import { useNavigate } from "react-router-dom";
import { useIngredients } from "../context/IngredientContext.tsx";
import "../styles/fridge.css";

const fridgeItems = [
  { name: "chicken", src: "/chicken.png", className: "chicken" },
  { name: "tomato", src: "/tomato.png", className: "tomato" },
  { name: "onion", src: "/onion.png", className: "onion" },
  { name: "lemon", src: "/lemon.png", className: "lemon" },
  { name: "garlic", src: "/garlic.png", className: "garlic" },
  { name: "avocado", src: "/avocado.png", className: "avocado" },
  { name: "beef", src: "/beef.png", className: "beef" },
  { name: "butter", src: "/butter.png", className: "butter" },
  { name: "carrot", src: "/carrot.png", className: "carrot" },
  { name: "corn", src: "/corn.png", className: "corn" },
  { name: "cucumber", src: "/cucumber.png", className: "cucumber" },
  { name: "ginger", src: "/ginger.png", className: "ginger" },
  { name: "milk", src: "/milk.png", className: "milk" },
  { name: "mushroom", src: "/mushroom.png", className: "mushroom" },
  { name: "potato", src: "/potato.png", className: "potato" }, 
  { name: "salmon", src: "/salmon.png", className: "salmon" }, 
  { name: "yogurt", src: "/yogurt.png", className: "yogurt" }, 
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
        <img src="/fridge.png" alt="fridge" className="full-image" />
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
              src={`/${item}.png`}
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
