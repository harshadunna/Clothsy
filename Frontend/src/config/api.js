import axios from "axios";

const LOCALHOST = "http://localhost:8080";

export const API_BASE_URL = LOCALHOST;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  // Dynamically select the token based on the environment being accessed
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const token = isAdminRoute ? localStorage.getItem("admin_jwt") : localStorage.getItem("jwt");
  
  if (token && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;