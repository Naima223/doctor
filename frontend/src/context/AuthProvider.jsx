// src/context/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Will store the same object your backend returns as `userData`
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------- ACTIONS ----------
  const login = async (email, password) => {
    // baseURL already = http://localhost:5000/api
    // so ONLY use /user/* (no extra /api)
    const { data } = await api.post("/user/login", { email, password });

    if (!data?.success) throw new Error(data?.message || "Login failed");
    localStorage.setItem("token", data.token); // client.js reads "token"
    setUser(data.userData || null);
    return data;
  };

  const register = async ({ name, email, password }) => {
    const { data } = await api.post("/user/register", { name, email, password });

    if (!data?.success) throw new Error(data?.message || "Registration failed");
    localStorage.setItem("token", data.token);
    setUser(data.userData || null);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // ---------- SESSION LOAD ----------
  const loadMe = async () => {
    try {
      // Your backend exposes: GET /api/user/profile
      const { data } = await api.get("/user/profile");
      if (data?.success) {
        // accept either { success, userData } or { success, user }
        setUser(data.userData || data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) loadMe();
    else setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
