import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser, isAuthenticated } from '../../services/authService';

export default function ProtectedRoute({ children, allowedRoles, currentRole }) {
  const location = useLocation();
  const loggedIn = isAuthenticated();
  const user = getCurrentUser();

  // 1. If user is NOT logged in, redirect directly to /login page
  if (!loggedIn || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2. Active role is user's actual registered role or active simulator role
  const effectiveRole = user.role || currentRole || 'Resident';

  // 3. If role is not allowed for this route, redirect to authorized home
  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    if (effectiveRole === 'Technician') {
      return <Navigate to="/system-health" replace state={{ from: location }} />;
    }
    if (effectiveRole === 'Resident') {
      return <Navigate to="/dashboard" replace state={{ from: location }} />;
    }
    return <Navigate to="/admin/dashboard" replace state={{ from: location }} />;
  }

  return children;
}
