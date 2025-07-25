import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
const backendURL = import.meta.env.VITE_BACKEND_URL;

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendURL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("Registration failed");
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
        />
        <button type="submit">Register</button>
        {message && <p className="error">{message}</p>}
      </form>
      <p>already have an account?</p>
      <button onClick={() => navigate("/login")}>login</button>
    </div>
  );
}
export default Register;
