'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const router = useRouter();
  const { toast } = useToast();

  // Function to check if user is logged in
  const checkUserLoggedIn = useCallback(async () => {
    try {
      setLoading(true);
      setAuthError(null);

      const res = await fetch('/api/auth/me');
      const data = await res.json();

      if (data.success) {
        setUser(data.data);
      } else {
        setUser(null);
        if (data.message) {
          setAuthError(data.message);
        }
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setUser(null);
      setAuthError('Failed to verify authentication status');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    checkUserLoggedIn();
  }, [checkUserLoggedIn]);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setAuthError(null);

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.data);

        toast({
          title: 'Registration Successful',
          description: `Welcome, ${data.data.name}!`,
        });

        if (data.data.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }

        return { success: true };
      } else {
        setAuthError(data.message || 'Registration failed');
        toast({
          title: 'Registration Failed',
          description: data.message || 'Failed to create account',
          variant: 'destructive',
        });
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAuthError('An error occurred during registration');
      toast({
        title: 'Registration Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { success: false, message: 'An error occurred during registration' };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      setAuthError(null);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.data);

        toast({
          title: 'Login Successful',
          description: `Welcome back, ${data.data.name}!`,
        });

        if (data.data.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }

        return { success: true };
      } else {
        setAuthError(data.message || 'Login failed');
        toast({
          title: 'Login Failed',
          description: data.message || 'Invalid credentials',
          variant: 'destructive',
        });
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('An error occurred during login');
      toast({
        title: 'Login Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { success: false, message: 'An error occurred during login' };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      const data = await res.json();

      if (data.success) {
        setUser(null);
        router.push('/login');

        toast({
          title: 'Logged Out',
          description: 'You have been successfully logged out',
        });
      } else {
        console.error('Logout failed:', data.message);
        toast({
          title: 'Logout Failed',
          description: 'There was a problem logging out',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh user data
  const refreshUserData = async () => {
    await checkUserLoggedIn();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        register,
        login,
        logout,
        refreshUserData,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isStudent: !!user && user.role !== 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
