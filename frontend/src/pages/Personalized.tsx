import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
const backendURL = import.meta.env.VITE_BACKEND_URL;

type Recipe = {
  id: number;
  title: string;
  image: string;
};

const Personalized = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPersonalized = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backendURL}/recipes/personalized`, {
          credentials: "include",
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(
            errData.error || "failed to fetch personalized recipes",
          );
        }

        const data = await res.json();
        setRecipes(data);
      } catch (err: any) {
        if (err.message === "please log in") {
          setError("please log in to see personalized recipes");
        } else {
          setError("something went wrong")
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPersonalized();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <p>error: {error}</p>;
  if (error === "please log in to see personalized recipes") return <p>{error}</p>

  return (
    <div className="recipe-container">
      <h2>recommended for you</h2>
      <div className="recipe-grid">
        {recipes.length === 0 ? (
          <p>no recs available</p>
        ) : (
          recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="recipe-image"
              />
              <h3 className="recipe-title">{recipe.title}</h3>
              <button
                className="view-button"
                onClick={() => navigate(`/recipes/${recipe.id}`)}
              >
                View Recipe
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Personalized;
