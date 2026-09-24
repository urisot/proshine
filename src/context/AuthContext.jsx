import { createContext, useContext, useState } from 'react';
import * as authService from '../services/authService.js';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getSession());

  function handleRegister(data) {
    const result = authService.register(data);
    if (result.success) {
      setSession(authService.getSession());
    }
    return result;
  }

  function handleLogin(data) {
    const result = authService.login(data);
    if (result.success) {
      setSession(authService.getSession());
    }
    return result;
  }

  function handleLogout() {
    authService.logout();
    setSession(null);
  }

  const value = {
    session,
    isAuthenticated: Boolean(session),
    isAdmin: session?.role === 'admin',
    register: handleRegister,
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };
