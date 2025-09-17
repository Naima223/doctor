// src/api/client.js
import axios from "axios";

const baseURL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

const client = axios.create({ baseURL });

// Attach token on every request
client.interceptors.request.use((config) => {
  // reads your current key; also falls back to qd_token if ever used
  const token =
    localStorage.getItem("token") || localStorage.getItem("qd_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler: clear token and send to /login
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("qd_token");
      // use hard redirect to reset app state cleanly
      window.location.replace("/login");
    }
    return Promise.reject(err);
  }
);

export default client;
