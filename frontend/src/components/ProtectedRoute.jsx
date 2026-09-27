import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="container py-5 text-center">
        <div className="ev-card p-5 mx-auto" style={{ maxWidth: '500px' }}>
          <h4 className="text-danger fw-bold mb-2">Access Denied</h4>
          <p className="text-muted">You do not have permission to view this portal with your current role ({user?.role}).</p>
          <a href="/" className="btn-emerald text-decoration-none mt-3">Return to Home</a>
        </div>
      </div>
    );
  }

  return children;
}
