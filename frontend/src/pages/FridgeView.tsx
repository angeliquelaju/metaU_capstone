import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FridgeView = () => {
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
        <button className="back-button" onClick={() => navigate("/kitchen")}>
          ← Back
        </button>
        <img src="/src/assets/fridge.png" alt="fridge" className="full-image" />
        <button className="chicken" onClick={() => handleSelect("chicken")}>
          <img src="/src/assets/chicken.png" alt="chicken"/>
        </button>
        <button className="tomato" onClick={() => handleSelect("tomato")}>
          <img src="/src/assets/tomato.png" alt="tomato" />
        </button>
        <button className="onion" onClick={() => handleSelect("onion")}>
          <img src="/src/assets/onion.png" alt="onion" />
        </button>
        <button className="lemon" onClick={() => handleSelect("lemon")}>
          <img src="/src/assets/lemon.png" alt="lemon" />
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
export default FridgeView;
