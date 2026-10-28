import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function RouteGuard({ children, role }) {
  const { currentUser, getUserById } = useAuth();
  const location = useLocation();
  const storedUser = currentUser ? getUserById(currentUser.id) : null;

  if (!currentUser || !storedUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && storedUser.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (
    role === 'Vendor' &&
    storedUser.status !== 'Verified' &&
    location.pathname !== '/vendor/pending'
  ) {
    return <Navigate to="/vendor/pending" replace />;
  }

  return children;
}

export default RouteGuard;
