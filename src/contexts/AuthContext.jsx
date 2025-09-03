import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authAPI.getCurrentUser();
    console.log('AuthContext useEffect - currentUser from localStorage:', currentUser);
    if (currentUser && authAPI.isAuthenticated()) {
      setUser(currentUser);
      console.log('AuthContext useEffect - User set from localStorage:', currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    console.log('Login API response:', response);
    console.log('Response data:', response.data);
    console.log('Response data keys:', Object.keys(response.data || {}));
    
    if (response.success) {
      setUser(response.data); // response.data contains the user object directly
      console.log('User set to:', response.data);
      console.log('User role_id:', response.data.role_id);
      console.log('User role:', response.data.role);
    }
    return response;
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
