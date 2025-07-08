import { NavLink } from "react-router-dom";
import { FaHome, FaUser, FaUtensils } from "react-icons/fa";
import { RiFridgeFill } from "react-icons/ri";
import { PiNotepadFill } from "react-icons/pi";

const Sidebar = () => {
  const getClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? "active-link" : "";

  return (
    <div className="sidebar">
      <NavLink to="/" className={getClassName}>
        <FaHome className="icon" />
        Home
      </NavLink>

      <NavLink to="/kitchen" className={getClassName}>
        <RiFridgeFill className="icon" />
        Kitchen
      </NavLink>

      <NavLink to="/recipes" className={getClassName}>
        <FaUtensils className="icon" />
        Recipes
      </NavLink>

      <NavLink to="/personalized" className={getClassName}>
        <PiNotepadFill className="icon" />
        Recs
      </NavLink>

      <NavLink to="/planner" className={getClassName}>
        <PiNotepadFill className="icon" />
        Meal Plan
      </NavLink>

      <NavLink to="/grocery" className={getClassName}>
        <PiNotepadFill className="icon" />
        Grocery List
      </NavLink>

      <NavLink to="/profile" className={getClassName}>
        <FaUser className="icon" />
        Profile
      </NavLink>
    </div>
  );
};

export default Sidebar;
