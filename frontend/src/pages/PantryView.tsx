import { useState } from "react";
import { useNavigate } from "react-router-dom";

const pantryItems = [
  { name: "garlic", src: "/src/assets/garlic.png" },
  { name: "saltPepper", src: "/src/assets/saltPepper.png" },
];

const PantryView = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const navigate = useNavigate();
  const handleSelect = (ingredient: string) => {
    if (!selected.includes(ingredient)) {
      setSelected([...selected, ingredient]);
    }
  };
  return (
    <div className="fridge-view-container">
      <div className="fridge">
        <button className="back-button" onClick={() => navigate("/Kitchen")}>
          ← Back
        </button>
        <img src="/src/assets/pantry.png" alt="pantry" className="full-image" />
        <button className="garlic" onClick={() => handleSelect("garlic")}>
          <img src="/src/assets/garlic.png" alt="garlic" />
        </button>
        <button className="saltPepper" onClick={() => handleSelect("saltPepper")}>
          <img src="/src/assets/saltPepper.png" alt="saltPepper" />
        </button>
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
            />
          ))}
        </div>
      </div>
    </div>
  );
};
export default PantryView;
