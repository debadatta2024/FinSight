import { useEffect, useState } from 'react';
import { getToken, setToken, setUnauthorizedHandler } from './api';
import AuthForm from './components/AuthForm';
import Dashboard from './Dashboard';

const USER_KEY = 'finsight_user';

// If a token and user were saved from a previous visit, start logged in.
function loadSavedUser() {
  try {
    return getToken() ? JSON.parse(localStorage.getItem(USER_KEY)) : null;
  } catch {
    return null;
  }
}

// App only decides which screen to show: login/register or the dashboard.
export default function App() {
  const [user, setUser] = useState(loadSavedUser);

  const handleAuth = ({ token, user }) => {
    setToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setUser(user);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  // Let api.js log us out automatically if the server rejects an expired token.
  useEffect(() => {
    setUnauthorizedHandler(handleLogout);
  }, []);

  return user ? (
    <Dashboard user={user} onLogout={handleLogout} />
  ) : (
    <AuthForm onAuth={handleAuth} />
  );
}
