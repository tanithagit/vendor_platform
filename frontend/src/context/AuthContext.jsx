import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/authAPI';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('user_id');

    if (token && role) {
      setUser({ token, role, userId });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    const { access_token, role, user_id } = response.data;

    // Save to localStorage
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('role', role);
    localStorage.setItem('user_id', user_id);

    setUser({ token: access_token, role, userId: user_id });
    return role;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};