import { useEffect, useMemo, useState } from "react";

const CART_KEY = "techmart_cart";
const CART_EVENT = "techmart-cart-updated";

const readCart = () => JSON.parse(localStorage.getItem(CART_KEY) || "[]");

const writeCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: cart }));
};

export const useCart = () => {
  const [cart, setCart] = useState(readCart);

  useEffect(() => {
    const syncCart = (event) => {
      if (event.type === "storage") {
        setCart(readCart());
        return;
      }

      setCart(event.detail || readCart());
    };

    window.addEventListener("storage", syncCart);
    window.addEventListener(CART_EVENT, syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener(CART_EVENT, syncCart);
    };
  }, []);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const addToCart = (product, quantity = 1) => {
    const nextCart = (() => {
      const existing = cart.find((item) => item._id === product._id);
      if (existing) {
        return cart.map((item) => (item._id === product._id ? { ...item, quantity: item.quantity + quantity } : item));
      }

      return [...cart, { ...product, quantity }];
    })();

    setCart(nextCart);
    writeCart(nextCart);
    return nextCart;
  };

  const updateQuantity = (productId, quantity) => {
    const nextCart = cart
      .map((item) => (item._id === productId ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);

    setCart(nextCart);
    writeCart(nextCart);
    return nextCart;
  };

  const removeFromCart = (productId) => {
    const nextCart = cart.filter((item) => item._id !== productId);
    setCart(nextCart);
    writeCart(nextCart);
    return nextCart;
  };

  const clearCart = () => {
    setCart([]);
    writeCart([]);
  };

  return {
    cart,
    cartCount,
    cartTotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  };
};
