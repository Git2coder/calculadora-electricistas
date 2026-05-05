import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [open, setOpen] = useState(false);

  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
    setOpen(true); // abre automáticamente
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const total = cart.reduce((acc, p) => acc + p.precio, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, total, open, setOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);