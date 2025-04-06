'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute component for client-side route protection
 * 
 * This component:
 * 1. Checks if the user is authenticated
 * 2. Redirects to login if not authenticated
 * 3. Can restrict access based on role (admin or student)
 * 4. Shows a loading state while checking authentication
 * 
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Child components to render if authenticated
 * @param {string} props.requiredRole Optional role requirement ('admin' or 'student')
 * @returns {React.ReactNode} Protected content or loading state
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // If authentication check is complete and user is not authenticated, redirect to login
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // If role is required and user doesn't have that role, redirect appropriately
    if (!loading && isAuthenticated && requiredRole) {
      if (requiredRole === 'admin' && !isAdmin) {
        router.push('/dashboard'); // Redirect non-admin users to student dashboard
        return;
      }
      
      if (requiredRole === 'student' && isAdmin) {
        router.push('/admin'); // Redirect admin users to admin dashboard
        return;
      }
    }
  }, [loading, isAuthenticated, isAdmin, requiredRole, router]);
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }
  
  // If authentication check is complete and user is authenticated with correct role, render children
  if (!loading && isAuthenticated) {
    if (requiredRole === 'admin' && !isAdmin) {
      return null; // Don't render anything while redirecting
    }
    
    if (requiredRole === 'student' && isAdmin) {
      return null; // Don't render anything while redirecting
    }
    
    return children;
  }
  
  // Don't render anything while redirecting to login
  return null;
}
