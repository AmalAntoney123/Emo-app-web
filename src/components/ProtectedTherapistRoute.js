import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function ProtectedTherapistRoute({ children }) {
  const { user, isTherapist, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isTherapist) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedTherapistRoute; 