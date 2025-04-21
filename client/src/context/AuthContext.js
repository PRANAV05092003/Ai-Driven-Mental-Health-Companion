import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the AuthContext
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if the user is already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      // Check if there's a token in localStorage
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Configure axios to send the token with every request
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch the current user data
          const response = await axios.get('/api/users/profile');
          setCurrentUser(response.data);
        } catch (err) {
          // If the token is invalid, remove it
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setError('Session expired. Please login again.');
        }
      }
      
      setLoading(false);
    };
    
    checkLoggedIn();
  }, []);
  
  // Register a new user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/auth/register', userData);
      
      // Store the token
      localStorage.setItem('token', response.data.token);
      
      // Set the Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // Set the current user
      setCurrentUser(response.data.user);
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Login an existing user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/auth/login', { email, password });
      
      // Store the token
      localStorage.setItem('token', response.data.token);
      
      // Set the Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // Set the current user
      setCurrentUser(response.data.user);
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout the current user
  const logout = () => {
    // Remove the token from localStorage
    localStorage.removeItem('token');
    
    // Remove the Authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear the current user
    setCurrentUser(null);
  };
  
  // Update the user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put('/api/users/profile', userData);
      
      // Update the current user
      setCurrentUser(response.data);
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Context value
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 