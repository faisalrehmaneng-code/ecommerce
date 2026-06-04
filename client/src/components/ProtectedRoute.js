import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { logoutUser } from '../redux/action/userAction';

const ProtectedRoute = ({ children, rolesAllowed }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.handleUser.user);

  useEffect(() => {
    const handleStorage = () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser && user) {
        dispatch(logoutUser());
      }
    };
    window.addEventListener('storage', handleStorage);
    handleStorage();
    return () => window.removeEventListener('storage', handleStorage);
  }, [dispatch, user]);

  if (!user) return <Navigate to='/login' replace />;

  if (rolesAllowed && !rolesAllowed.includes(user.role))
    return <Navigate to='/' replace />;

  return children;
};

export default ProtectedRoute;
