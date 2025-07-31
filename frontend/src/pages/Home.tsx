import { FaUser, FaUtensils, FaClipboardList } from "react-icons/fa";
import { PiNotepadFill } from "react-icons/pi";
import { IoCalendar, IoFastFood } from "react-icons/io5";
import "../styles/home.css";

  const features = [
    {
      title: "Recipe Generator",
      icon: <FaUtensils />,
      description: "Generate recipes based on the selected ingredients in the Kitchen page"
    },
    {
      title: "Personalized Recommendations",
      icon: <PiNotepadFill />,
      description: "Recommended recipes based on recipes you have liked, by getting the top 5 ingredients"
    },
    {
      title: "Meal Planner",
      icon: <IoCalendar />,
      description: "Generate a meal plan based on number of meals/day and saved recipe servings"
    },
    {
      title: "Grocery List",
      icon: <FaClipboardList />,
      description: "Automatically create a grocery list from the meal plan, arranged by aisle"
    },
    {
      title: "User Suggestions",
      icon: <FaUser />,
      description: "Get the top 5 users with the highest similarity score to you based on saved/liked recipes and ingredients"
    },
    {
      title: "Similar Users Recipe Recommendations",
      icon: <IoFastFood />,
      description: "More recipe recommendations from the top 5 most similar users"
    },
  ]
export default function Home() {
  return (
    <>
      <h1>Welcome to Find Me Recipes</h1>
      <h3>Please log in or register to see the features of this site</h3>
      <div className = "feature">
        <h2 className="title">Project Features</h2>
        <div className = "feature-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-title">{feature.title}</div>
              <div className="feature-desc">{feature.description}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
