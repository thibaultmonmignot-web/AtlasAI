import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, isAdminUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isAdminUser()) {
      toast.error('Access Denied');
      navigate('/');
    }
  }, [isAuthenticated, isAdminUser, navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminUser()) {
    return null; // Will navigate away via useEffect
  }

  return children;
};

export default ProtectedAdminRoute;
