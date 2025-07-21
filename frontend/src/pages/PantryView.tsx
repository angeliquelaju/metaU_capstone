import { useNavigate } from "react-router-dom";
import { useIngredients } from "../context/IngredientContext.tsx";

const pantryItems = [
  { name: "garlic", src: "/public/garlic.png", className: "garlic" },
  {
    name: "salt",
    src: "/public/salt.png",
    className: "salt",
  },
  {
    name: "pepper",
    src: "/public/pepper.png",
    className: "pepper",
  },
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
        <img src="/public/pantry.png" alt="pantry" className="full-image" />
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
              src={`/public/${item}.png`}
              alt={item}
              className="selected-ingredients"
              onClick={() => removeIngredient(item)}
            />
          ))}
        </div>
        <button
          className="fridge-button"
          onClick={() => navigate("/fridge-view")}
        >fridge</button>
        <button
          className="recipe-button"
          onClick={() => navigate("/recipes")}
        >generate recipe</button>
      </div>
    </div>
  );
};
export default PantryView;
