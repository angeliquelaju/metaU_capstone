import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import "../styles/profile.css";
const backendURL = import.meta.env.VITE_BACKEND_URL;

interface Suggestion {
  id: number;
  username: string;
  similarity: number;
  recipeScore: number;
  ingredientScore: number;
}

const FriendSuggestion: React.FunctionComponent = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`${backendURL}/friends/suggestions`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("failed to fetch suggestions");
        const data = await res.json();
        setSuggestions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, []);
  if (loading) return <LoadingSpinner />;
  if (error) return <p>error: {error}</p>;
  if (suggestions.length === 0) return <p>No similar users found</p>;

  return (
    <div className="suggestions">
      <h3 className="suggested-users">Suggested Users</h3>
      <div className="user-list">
        {suggestions.map((s) => (
          <div key={s.id} className="users">
            <img src="/default.png" alt="profile" className="user-pic" />
            <div className="user-info">
              <Link className="username" to={`/user/${s.username}`}>
                <strong>{s.username}</strong>
              </Link>
              <p className="match-score">
                <b>{Math.round(s.similarity * 100)}% match</b>
              </p>
              <p className="score-details">
                Recipes Score: <b>{Math.round(s.recipeScore * 100)}% </b>
                Ingredients Score: <b>{Math.round(s.ingredientScore * 100)}%</b>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendSuggestion;
