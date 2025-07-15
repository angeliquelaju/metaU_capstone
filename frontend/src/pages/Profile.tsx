import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FriendSuggestion from "../components/FriendSuggestion";

function Profile({
  user,
  setUser,
}: {
  user: string;
  setUser: (u: string | null) => void;
}) {
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch("http://localhost:4000/logout", {
      credentials: "include",
    });
    setUser(null);
  };

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await fetch("http://localhost:4000/recipes/user", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("failed to fetch saved recipes");
        const data = await res.json();
        setSaved(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  return (
    <div className="container">
      <h2>Welcome, {user}</h2>
      <button onClick={handleLogout}>Log out</button>
      <h3>Saved Recipes</h3>
      {loading ? (
        <p>loading saved recipes...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : saved.length === 0 ? (
        <p>no recipes have been saved</p>
      ) : (
        <div className="recipe-grid">
          {saved.map((recipe) => (
            <div key={recipe.id} className="recipe-card">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="recipe-image"
              />
              <h4>{recipe.title}</h4>
              <button
                className="view-button"
                onClick={() => navigate(`/recipes/${recipe.id}`)}
              >
                View Recipe
              </button>
            </div>
          ))}
        </div>
      )}
      <FriendSuggestion />
    </div>
  );
}
export default Profile;
