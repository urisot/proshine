import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService.js';
import { hasPanelAccess } from '../services/menuCatalog.js';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getSession());

  // Al abrir la app se actualizan los permisos de la sesión guardada.
  useEffect(() => {
    if (authService.getSession()) {
      authService.refreshSession().then(setSession).catch(() => {});
    }
  }, []);

  async function handleRegister(data) {
    const result = await authService.register(data);
    if (result.success) {
      setSession(authService.getSession());
    }
    return result;
  }

  async function handleLogin(data) {
    const result = await authService.login(data);
    if (result.success) {
      setSession(authService.getSession());
    }
    return result;
  }

  async function handleRefreshSession() {
    const refreshed = await authService.refreshSession();
    setSession(refreshed);
  }

  function handleLogout() {
    authService.logout();
    setSession(null);
  }

  const value = {
    session,
    isAuthenticated: Boolean(session),
    isAdmin: session?.role === 'admin',
    hasPanelAccess: hasPanelAccess(session),
    register: handleRegister,
    login: handleLogin,
    logout: handleLogout,
    refreshSession: handleRefreshSession,
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
