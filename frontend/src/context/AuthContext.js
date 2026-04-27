import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const BASE_URL = "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("ats_token") || null);
  const [loading, setLoading] = useState(true);

  // Attach token to all axios requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("ats_token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("ats_token");
    }
  }, [token]);

  // Re-hydrate user from token on mount
  useEffect(() => {
    const restore = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await axios.get(`${BASE_URL}/auth/me`);
        setUser(data.user);
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []); // eslint-disable-line

  const login = useCallback(async (email, password) => {
    const { data } = await axios.post(`${BASE_URL}/auth/login`, { email, password });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await axios.post(`${BASE_URL}/auth/register`, payload);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
