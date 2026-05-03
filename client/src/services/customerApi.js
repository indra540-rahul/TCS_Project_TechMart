import axios from "axios";

const customerApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

customerApi.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("techmart_customer_token") ||
    sessionStorage.getItem("techmart_customer_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default customerApi;
