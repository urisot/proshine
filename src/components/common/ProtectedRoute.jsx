import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getFirstAllowedPath, hasPanelAccess, hasPermission } from '../../services/menuCatalog.js';

// requiredRole: rol exacto. panel: cualquier rol con acceso al panel. permission: clave de menuCatalog.
function ProtectedRoute({ children, requiredRole = null, panel = false, permission = null }) {
  const { isAuthenticated, session } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/acceso" replace />;
  }

  if (requiredRole && session.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  if (panel && !hasPanelAccess(session)) {
    return <Navigate to="/" replace />;
  }

  if (permission && !hasPermission(session, permission)) {
    return <Navigate to={getFirstAllowedPath(session) || '/'} replace />;
  }

  return children;
}

export default ProtectedRoute;
