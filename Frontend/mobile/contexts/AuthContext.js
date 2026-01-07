/**
 * Authentication Context for Mobile App
 * Manages user authentication state and actions
 */

import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";
import { Alert } from "react-native";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await authAPI.isAuthenticated();

      if (isAuth) {
        const storedUser = await authAPI.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password, userType = "pet_owner") => {
    try {
      const response = await authAPI.login(username, password, userType);
      setUser(response.user);
      setIsAuthenticated(true);
      return { success: true, user: response.user };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Login failed. Please check your credentials.",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      // Do NOT auto-login after registration
      // User must login manually with their credentials
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Registration failed. Please try again.",
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout locally even if API call fails
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to change password.",
      };
    }
  };

  const updateUser = (userData) => {
    setUser((prevUser) => ({ ...prevUser, ...userData }));
  };

  // Role checks
  const isUser = user?.role === "user";
  const isVeterinarian = user?.role === "veterinarian";
  const isAdmin = user?.role === "admin";
  const isCatcher = user?.role === "catcher";
  const isStaff = isVeterinarian || isAdmin || isCatcher;

  const value = {
    user,
    loading,
    isAuthenticated,
    isUser,
    isVeterinarian,
    isAdmin,
    isCatcher,
    isStaff,
    login,
    register,
    logout,
    changePassword,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
