import React from 'react';
import { useAuth } from '../routes/AuthContext';
import { Redirect } from 'expo-router';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  console.log(user)
  // If the user is not authenticated, redirect to the login screen
  if (!user) {
    return <Redirect href="/signIn" />;
  }

  // If the user's role is not allowed, redirect to their respective dashboard
  if (!allowedRoles.includes(user.role)) {
    switch (user.role) {
      case 'user':
        return <Redirect href="/(protected)/user" />;
      case 'admin':
        return <Redirect href="/(protected)/admin" />;
      case 'stock_manager':
        return <Redirect href="/(protected)/stockmanager" />;
      default:
        return <Redirect href="/signIn" />;
    }
  }

  return children;
};

export default ProtectedRoute;
