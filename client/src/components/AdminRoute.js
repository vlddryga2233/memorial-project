import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('No token found');
    return <Navigate to="/login" />;
  }

  try {
    // Decode token to check if user is admin
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    console.log('Decoded token payload:', jsonPayload);
    const { user } = JSON.parse(jsonPayload);
    console.log('User from token:', user);
    console.log('Is admin:', user.isAdmin);

    if (!user.isAdmin) {
      console.log('User is not admin, redirecting to home');
      return <Navigate to="/" />;
    }

    console.log('User is admin, rendering admin panel');
    return children;
  } catch (err) {
    console.error('Error in AdminRoute:', err);
    return <Navigate to="/login" />;
  }
};

export default AdminRoute; 