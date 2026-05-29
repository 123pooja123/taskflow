import { useState } from "react";
import { authAPI } from "./api";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [user, setUser] = useState(() => authAPI.getUser());

  const handleAuth = (u) => setUser(u);
  const handleLogout = () => { authAPI.logout(); setUser(null); };

  return user
    ? <Dashboard user={user} onLogout={handleLogout} />
    : <AuthPage onAuth={handleAuth} />;
}
