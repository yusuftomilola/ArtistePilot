import axios from "axios";

const api = axios.create({
  baseURL: "https://artistepilot.onrender.com",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
