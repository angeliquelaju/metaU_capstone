import { useEffect, useState } from "react";
import type { GroceryItem } from "../types";
const backendURL = import.meta.env.VITE_BACKEND_URL;

export default function GroceryList() {
  const [list, setList] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${backendURL}/grocery`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 && data.message === "please log in") {
          setList([]);
          setError("please log in");
        } else {
          throw new Error(data.error || "failed to fetch grocery list");
        }
        return;
      }
      setList(data);
    } catch (err) {
      console.error("error loading grocery list: ", err);
      setError("something went wrong");
    } finally {
      setLoading(false);
    }
    };
    load();
  }, []);

  if (loading) return <p>loading ...</p>;
  if (error === "please log in") return <p>please log in</p>
  if (error) return <p>error: {error}</p>;

  return (
    <div>
      <h2>grocery list</h2>
      {list.length === 0 ? (
        <p>nothing to buy</p>
      ) : (
        list.map((group) => (
          <div key={group.category}>
            <h3>{group.category}</h3>
            <ul>
              {group.ingredients.map((item) => (
                <li key={`${group.category}-${item.name}`}>
                  {item.name}: {item.amount} {item.unit}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
