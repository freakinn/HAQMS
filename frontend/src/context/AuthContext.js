'use client';

import React, { createContext, useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

const AuthContext = createContext();

const readSessionAuth = () => {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }

  const storedToken = sessionStorage.getItem('haqms_token');
  const storedUser = sessionStorage.getItem('haqms_user');

  if (!storedToken || !storedUser) {
    return { token: null, user: null };
  }

  try {
    return {
      token: storedToken,
      user: JSON.parse(storedUser),
    };
  } catch (e) {
    console.error('Failed to parse user details from sessionStorage', e);
    sessionStorage.removeItem('haqms_token');
    sessionStorage.removeItem('haqms_user');
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({ token: null, user: null });
  const { user, token } = authState;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthState(readSessionAuth());
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Inconsistent API returns nested success format for login
      const receivedToken = data.data.token;
      const receivedUser = data.data.user;

      sessionStorage.setItem('haqms_token', receivedToken);
      sessionStorage.setItem('haqms_user', JSON.stringify(receivedUser));

      setAuthState({ token: receivedToken, user: receivedUser });

      router.push('/dashboard');
      return { success: true };
    } catch (err) {
      console.error('[AUTH-ERROR] Login request failed:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role = 'RECEPTIONIST') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // If registration succeeds, log them in automatically or redirect to login.
      // Notice inconsistency: signup API returns flat user structure inside "user"
      // we can trigger login for them.
      return login(email, password);
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('haqms_token');
    sessionStorage.removeItem('haqms_user');
    setAuthState({ token: null, user: null });
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        API_BASE_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
