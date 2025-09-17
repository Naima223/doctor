
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);   // stores backend userData
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const { data } = await api.post("/user/login", { email, password });
    if (!data?.success) throw new Error(data?.message || "Login failed");
    localStorage.setItem("token", data.token);
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

  const loadMe = async () => {
    try {
      const { data } = await api.get("/user/profile");
      if (data?.success) {
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
