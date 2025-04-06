'use client';

import ProtectedRoute from './ProtectedRoute';

/**
 * StudentRoute component for client-side student route protection
 * 
 * This component wraps the ProtectedRoute component with the 'student' role requirement
 * 
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Child components to render if authenticated as student
 * @returns {React.ReactNode} Protected student content
 */
export default function StudentRoute({ children }) {
  return <ProtectedRoute requiredRole="student">{children}</ProtectedRoute>;
}
