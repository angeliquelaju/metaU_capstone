import { NavLink } from "react-router-dom";
import { FaHome, FaUser, FaUtensils } from "react-icons/fa";
import { RiFridgeFill } from "react-icons/ri";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <NavLink
        to="/"
        className={({ isActive }) => (isActive ? "active-link" : "")}
      >
        <FaHome className="icon"/>
        Home
      </NavLink>

      <NavLink
        to="/kitchen"
        className={({ isActive }) => (isActive ? "active-link" : "")}
      >
        <RiFridgeFill className="icon"/>
        Kitchen
      </NavLink>

      <NavLink
        to="/recipes"
        className={({ isActive }) => (isActive ? "active-link" : "")}
      >
        <FaUtensils className="icon"/>
        Recipes
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) => (isActive ? "active-link" : "")}
      >
        <FaUser className="icon"/>
        Profile
      </NavLink>
    </div>
  );
};

export default Sidebar;
