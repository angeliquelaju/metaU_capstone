import { NavLink } from "react-router-dom";
import { FaHome, FaUser, FaUtensils, FaClipboardList } from "react-icons/fa";
import { RiFridgeFill } from "react-icons/ri";
import { PiNotepadFill } from "react-icons/pi";
import { IoCalendar } from "react-icons/io5";
import "../styles/sidebar.css";

const Sidebar = () => {
  const getClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? "active-link" : "";

  return (
    <div className="sidebar">
      <h2>Find Me Recipes</h2>
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
        <IoCalendar className="icon" />
        Meal Plan
      </NavLink>

      <NavLink to="/grocery" className={getClassName}>
        <FaClipboardList className="icon" />
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
