'use client';

import ProtectedRoute from './ProtectedRoute';

/**
 * AdminRoute component for client-side admin route protection
 * 
 * This component wraps the ProtectedRoute component with the 'admin' role requirement
 * 
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Child components to render if authenticated as admin
 * @returns {React.ReactNode} Protected admin content
 */
export default function AdminRoute({ children }) {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
}
