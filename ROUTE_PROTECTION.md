# Route Protection in QR Code Attendance System

This document explains how route protection works in the QR Code Attendance System.

## Overview

The system uses a combination of server-side middleware and client-side components to protect routes based on authentication status and user roles.

## Server-Side Middleware

The `middleware.js` file at the root of the project handles server-side route protection. It intercepts requests to protected routes and redirects users based on their authentication status and role.

### How It Works

1. When a request is made to a protected route, the middleware checks for a JWT token in the cookies.
2. If the token is valid, the middleware extracts the user's role from the token.
3. Based on the route and the user's role, the middleware decides whether to allow the request or redirect the user.

### Protected Routes

- **Authentication Routes** (`/login`, `/register`):
  - If the user is already authenticated, they are redirected to their appropriate dashboard.

- **Student Routes** (`/dashboard`, `/dashboard/*`):
  - If the user is not authenticated, they are redirected to the login page.
  - All authenticated users can access these routes.

- **Admin Routes** (`/admin`, `/admin/*`):
  - If the user is not authenticated, they are redirected to the login page.
  - If the user is authenticated but not an admin, they are redirected to the student dashboard.

## Client-Side Route Protection

In addition to server-side middleware, the system also uses client-side components to protect routes:

### Components

1. **ProtectedRoute** (`src/components/ProtectedRoute.jsx`):
   - Base component for client-side route protection.
   - Checks if the user is authenticated and redirects to login if not.
   - Can require a specific role (admin or student).
   - Shows a loading state while checking authentication.

2. **AdminRoute** (`src/components/AdminRoute.jsx`):
   - Wraps the ProtectedRoute component with the 'admin' role requirement.
   - Used to protect admin pages.

3. **StudentRoute** (`src/components/StudentRoute.jsx`):
   - Wraps the ProtectedRoute component with the 'student' role requirement.
   - Used to protect student pages.

### Usage

To protect a page, wrap its content with the appropriate route component:

```jsx
// For admin pages
export default function AdminPage() {
  return (
    <AdminRoute>
      <AdminContent />
    </AdminRoute>
  );
}

// For student pages
export default function StudentPage() {
  return (
    <StudentRoute>
      <StudentContent />
    </StudentRoute>
  );
}

// For pages that require authentication but no specific role
export default function AuthenticatedPage() {
  return (
    <ProtectedRoute>
      <PageContent />
    </ProtectedRoute>
  );
}
```

## Authentication Context

The `AuthContext` (`src/context/AuthContext.js`) provides authentication state and functions to all components:

- `user`: The currently authenticated user or null if not authenticated.
- `loading`: Whether authentication is being checked.
- `authError`: Any authentication error that occurred.
- `isAuthenticated`: Whether the user is authenticated.
- `isAdmin`: Whether the user is an admin.
- `isStudent`: Whether the user is a student.
- `register`: Function to register a new user.
- `login`: Function to log in a user.
- `logout`: Function to log out the current user.
- `refreshUserData`: Function to refresh the user's data.

## Best Practices

1. Use both server-side middleware and client-side components for maximum security.
2. Always check authentication status before rendering sensitive content.
3. Use the appropriate route protection component based on the required role.
4. Handle loading states to provide a good user experience.
5. Provide clear error messages when access is denied.
