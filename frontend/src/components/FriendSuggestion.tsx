import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Suggestion {
  id: number;
  username: string;
  similarity: number;
}

const FriendSuggestion: React.FunctionComponent = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch("http://localhost:4000/friends/suggestions", {
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
  if (loading) return <p>loading suggestions...</p>;
  if (error) return <p>error: {error}</p>;
  if (suggestions.length === 0) return <p>no similar users found</p>;

  return (
    <div className="suggestions">
      <h3>suggested users</h3>
      <ul>
        {suggestions.map((s) => (
          <li key={s.id}>
            <Link to={`/user/${s.username}`}>
              <strong>{s.username}</strong> - {Math.round(s.similarity * 100)}%
              match
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendSuggestion;
