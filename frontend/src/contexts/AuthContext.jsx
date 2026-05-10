import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const checkAuth = async () => {
    try {
      // First ensure we have CSRF cookie (Sanctum)
      await api.get('/sanctum/csrf-cookie', { baseURL: 'http://localhost:8000' });
      
      const response = await api.get('/user');
      setUser(response.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    // Ensure CSRF cookie
    await api.get('/sanctum/csrf-cookie', { baseURL: 'http://localhost:8000' });
    
    const response = await api.post('/login', { email, password });
    
    if (response.data.token) {
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
    }
    
    return response.data;
  };

  const register = async (name, email, password, password_confirmation) => {
    // Ensure CSRF cookie
    await api.get('/sanctum/csrf-cookie', { baseURL: 'http://localhost:8000' });
    
    const response = await api.post('/register', { 
      name, 
      email, 
      password, 
      password_confirmation 
    });
    
    if (response.data.token) {
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
    }
    
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    }
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
