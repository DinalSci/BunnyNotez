import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, initializeStorage } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
    const user = api.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      api.syncPortalData();
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password, role) => {
    const res = await api.login({ identifier, password, role });
    if (res.success && res.user) {
      setCurrentUser(res.user);
      api.syncPortalData();
      return res.user;
    }
    throw new Error(res.error || 'Login failed');
  };

  const register = async ({ name, email, password, phone, batch }) => {
    const res = await api.registerStudent({ name, email, password, phone, batch });
    if (res.success && res.user) {
      setCurrentUser(res.user);
      api.syncPortalData();
      return res;
    }
    throw new Error(res.error || 'Registration failed');
  };

  const logout = () => {
    api.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, loading }}>
      {!loading && children}
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
