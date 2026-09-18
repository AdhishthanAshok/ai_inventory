// Auth context provider - manages JWT token, user state, login/logout
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loginUser, registerUser, getMe } from "@/services/api";
import { logger } from "@/utils/logger";

interface User {
  id: string;
  username: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.trace("useAuth: Initializing auth state from localStorage");
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      getMe(savedToken)
        .then((data) => setUser(data))
        .catch(() => {
          logger.warn("useAuth: Token invalid or expired, clearing auth state");
          localStorage.removeItem("token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    logger.trace(`useAuth: Attempting login for ${username}`);
    const data = await loginUser(username, password);
    logger.trace("useAuth: Login successful");
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem("token", data.access_token);
  };

  const register = async (username: string, password: string) => {
    logger.trace(`useAuth: Attempting register for ${username}`);
    const data = await registerUser(username, password);
    logger.trace("useAuth: Register successful");
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem("token", data.access_token);
  };

  const logout = () => {
    logger.trace("useAuth: Logging out user");
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
