import {useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
  fallbackPath?: string;
}

export function AuthGuard({ 
  children, 
  allowedRoles = [], 
  fallbackPath = '/auth/login' 
}: AuthGuardProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (isLoading) {
      // Still loading, don't redirect yet
      return;
    }
    
    if (!isAuthenticated) {
      // Not authenticated, redirect to login
      navigate(fallbackPath, { 
        state: { from: location.pathname }
      });
      return;
    }
    
    // Check role-based access if roles are specified
    if (allowedRoles.length > 0 && user) {
      const hasAllowedRole = allowedRoles.includes(user.role);
      
      if (!hasAllowedRole) {
        // User doesn't have the required role, redirect to home
        navigate('/');
      }
    }
  }, [isAuthenticated, isLoading, user, navigate, location, allowedRoles, fallbackPath]);
  
  // Show loading indicator or nothing while checking auth
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // If not loading and authenticated, show children
  if (isAuthenticated) {
    // If roles are specified, check if user has allowed role
    if (allowedRoles.length > 0) {
      const hasAllowedRole = user && allowedRoles.includes(user.role);
      
      if (hasAllowedRole) {
        return <>{children}</>;
      }
      
      // Don't render anything if no allowed role
      return null;
    }
    
    // No roles specified, just render children
    return <>{children}</>;
  }
  
  // Don't render anything if not authenticated
  return null;
}
