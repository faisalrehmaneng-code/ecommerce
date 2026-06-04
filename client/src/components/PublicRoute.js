import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const user = useSelector(state => state.handleUser.user);

  if (user) {
    // Redirect logged-in users to home page
    return <Navigate to='/' replace />;
  }

  return children;
};

export default PublicRoute;
