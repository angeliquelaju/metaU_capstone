import { useEffect, useState } from "react";
import type { GroceryItem } from "../types";
const backendURL = import.meta.env.VITE_BACKEND_URL;

export default function GroceryList() {
  const [list, setList] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${backendURL}/grocery`, {
        credentials: "include",
      });
      const data = await res.json();
      setList(data);
      setLoading(false);
    };
    load();
  }, []);
  if (loading) return <p>loading ...</p>;

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
