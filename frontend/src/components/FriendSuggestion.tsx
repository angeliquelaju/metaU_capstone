import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
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
  if (suggestions.length === 0) return <p>No Similar Users Found</p>;

  return (
    <div className="suggestions">
      <h3>Suggested Users</h3>
      <ul>
        {suggestions.map((s) => (
          <li key={s.id}>
            <Link to={`/user/${s.username}`}>
              <strong>{s.username}</strong>
            </Link>
             - <b>{Math.round(s.similarity * 100)}% match</b>
             <div className="score-details">
                Recipes Score: <b>{Math.round(s.recipeScore * 100)}% </b>
                Ingredients Score: <b>{Math.round(s.ingredientScore * 100)}%</b>
             </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendSuggestion;
