import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const UserProfile = () => {
  const { username } = useParams();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserRecipes = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/recipes/user/${username}`
        );
        if (!res.ok) throw new Error("failed to load user recipes");
        const data = await res.json();
        setRecipes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserRecipes();
  }, [username]);

  return (
    <div className="container">
      <h2>{username}'s saved recipes</h2>
      {loading ? (
        <p>loading...</p>
      ) : error ? (
        <p>error: {error}</p>
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="recipe-image"
              />
              <h4>{recipe.title}</h4>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default UserProfile;
