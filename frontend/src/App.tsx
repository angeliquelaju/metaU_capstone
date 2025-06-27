import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Kitchen from "./pages/Kitchen";
import Recipes from "./pages/Recipes";
import FridgeView from "./pages/FridgeView";
import PantryView from "./pages/PantryView.tsx";
import Sidebar from "./components/Sidebar.tsx";

function App() {
  const [user, setUser] = useState<string | null>(null);
  useEffect(() => {
    fetch("http://localhost:4000/session", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUser(data.username);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <Home />
            } 
          />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/kitchen"
            element={
              <Kitchen />
            } 
          />
          <Route path="/recipes" element={<Recipes />} />
          <Route
            path="/profile"
            element={
              user ? (
                <Profile user={user} setUser={setUser} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/fridge-view" element={<FridgeView />} />
          <Route path="/pantry-view" element={<PantryView />} />
        </Routes>
      </main>
    </div>
  );
}
export default App;
