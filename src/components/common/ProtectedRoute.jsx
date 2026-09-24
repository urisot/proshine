import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, session } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/acceso" replace />;
  }

  if (requiredRole && session.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
