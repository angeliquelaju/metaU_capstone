import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

function App() {
  const [user, setUser] = useState<string | null>(null);
  useEffect(() => {
    fetch('http://localhost:4000/session', {
      credentials: 'include',
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
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/profile" />: <Navigate to ="/login" />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
export default App;