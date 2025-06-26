import React from 'react';
import { useNavigate } from 'react-router-dom';

const Kitchen = () => {
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <img src="/src/assets/kitchen.png" alt="kitchen" className="kitchen-image" />
      <button className="fridge-area" onClick={() => navigate('/fridge-view')}></button>
      <button className="pantry-area" onClick={() => navigate('/pantry-view')}></button>
    </div>
  );
};
export default Kitchen;