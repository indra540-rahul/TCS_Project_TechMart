import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const AuthContext = createContext(null);
const readStoredAuth = (key) => localStorage.getItem(key) || sessionStorage.getItem(key);
const clearStoredAuth = () => {
  localStorage.removeItem("techmart_token");
  localStorage.removeItem("techmart_user");
  sessionStorage.removeItem("techmart_token");
  sessionStorage.removeItem("techmart_user");
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = readStoredAuth("techmart_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => readStoredAuth("techmart_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/profile");
        setUser(data);
      } catch (_error) {
        setUser(null);
        setToken(null);
        clearStoredAuth();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [token]);

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    const storage = credentials.rememberMe ? localStorage : sessionStorage;
    clearStoredAuth();
    storage.setItem("techmart_token", data.token);
    storage.setItem("techmart_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name}`);
    return data.user;
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
    setToken(null);
    toast.success("Logged out successfully");
  };

  return <AuthContext.Provider value={{ user, token, login, logout, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
