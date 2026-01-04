import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:5000/jshope", //lokal
  baseURL: "https://jshope-backend-phs3.vercel.app/jshope", //production
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
