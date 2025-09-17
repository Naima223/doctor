import axios from "axios";

const baseURL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

const client = axios.create({ baseURL });

// Attach token on every request
client.interceptors.request.use((config) => {
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
      window.location.replace("/login");
    }
    return Promise.reject(err);
  }
);

export default client;
