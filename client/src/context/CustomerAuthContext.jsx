import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import customerApi from "../services/customerApi";

const CustomerAuthContext = createContext(null);

const readStoredCustomerAuth = (key) =>
  localStorage.getItem(key) || sessionStorage.getItem(key);

const clearStoredCustomerAuth = () => {
  localStorage.removeItem("techmart_customer_token");
  localStorage.removeItem("techmart_customer_user");
  sessionStorage.removeItem("techmart_customer_token");
  sessionStorage.removeItem("techmart_customer_user");
};

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(() => {
    const saved = readStoredCustomerAuth("techmart_customer_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() =>
    readStoredCustomerAuth("techmart_customer_token")
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await customerApi.get("/customers/me");
        setCustomer(data);
      } catch (_error) {
        clearStoredCustomerAuth();
        setCustomer(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [token]);

  const persistCustomerSession = (data, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    clearStoredCustomerAuth();
    storage.setItem("techmart_customer_token", data.token);
    storage.setItem("techmart_customer_user", JSON.stringify(data.customer));
    setToken(data.token);
    setCustomer(data.customer);
  };

  const loginCustomer = async (credentials) => {
    const { data } = await customerApi.post("/customers/login", credentials);
    persistCustomerSession(data, credentials.rememberMe);
    toast.success(`Welcome, ${data.customer.name}`);
    return data.customer;
  };

  const registerCustomer = async (payload) => {
    const { data } = await customerApi.post("/customers/register", payload);
    persistCustomerSession(data, payload.rememberMe);
    toast.success(`Account created for ${data.customer.name}`);
    return data.customer;
  };

  const updateCustomer = async (payload) => {
    const { data } = await customerApi.put("/customers/me", payload);
    const storedToken = readStoredCustomerAuth("techmart_customer_token");
    const customerStorage = localStorage.getItem("techmart_customer_token")
      ? localStorage
      : sessionStorage;

    if (storedToken) {
      customerStorage.setItem(
        "techmart_customer_user",
        JSON.stringify(data.customer)
      );
    }

    setCustomer(data.customer);
    toast.success(data.message || "Profile updated");
    return data.customer;
  };

  const logoutCustomer = () => {
    clearStoredCustomerAuth();
    setCustomer(null);
    setToken(null);
    toast.success("Signed out successfully");
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        token,
        loading,
        loginCustomer,
        registerCustomer,
        updateCustomer,
        logoutCustomer
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => useContext(CustomerAuthContext);
