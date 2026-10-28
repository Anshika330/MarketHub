import { createContext, useContext, useEffect, useState } from 'react';
import { fetchMe, fetchUsers, login as loginRequest, signup as signupRequest, TOKEN_KEY, updateUserStatus } from '../services/authApi';

const SESSION_STORAGE_KEY = 'markethub-demo-session';
const AuthContext = createContext(null);

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(readSession);

  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY)) {
      refreshSession();
    }
  }, []);

  const signup = async ({ name, email, password, role }) => {
    try {
      await signupRequest({ name, email, password, role });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const { user, token } = await loginRequest({ email, password });
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      setCurrentUser(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getUsers = async () => {
    try {
      return await fetchUsers();
    } catch {
      return [];
    }
  };

  const getUserById = (userId) => (currentUser?.id === userId ? currentUser : null);

  const updateVendorStatus = async (userId, status) => {
    try {
      const updated = await updateUserStatus(userId, status);
      if (currentUser?.id === userId) {
        setCurrentUser(updated);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
      }
      return true;
    } catch {
      return false;
    }
  };

  const refreshSession = async () => {
    try {
      const user = await fetchMe();
      setCurrentUser(user);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      return user;
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      setCurrentUser(null);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, getUsers, getUserById, updateVendorStatus, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export { AuthProvider, useAuth };
