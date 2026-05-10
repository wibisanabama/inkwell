import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const GuestRoute = () => {
  const { user, token, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (token && user) {
    // If user is already logged in, redirect them to the dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
