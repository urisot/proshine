import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import * as cartService from '../services/cartService.js';

const CartContext = createContext(null);

function CartProvider({ children }) {
  const { session } = useAuth();
  const userId = session?.id || null;
  const [items, setItems] = useState([]);
  const previousUserId = useRef(undefined);
  const isLoading = useRef(true);

  // Al cambiar de usuario (entrar o salir) se carga el carrito guardado de ese usuario.
  useEffect(() => {
    let isCurrent = true;
    isLoading.current = true;

    const load = userId ? cartService.mergeGuestCartInto(userId) : cartService.getCart(null);
    load.then((restored) => {
      if (!isCurrent) {
        return;
      }
      previousUserId.current = userId;
      isLoading.current = false;
      setItems(restored);
    });

    return () => {
      isCurrent = false;
    };
  }, [userId]);

  // Cada cambio del carrito se persiste para el dueño actual.
  useEffect(() => {
    if (isLoading.current || previousUserId.current !== userId) {
      return;
    }
    cartService.saveCart(userId, items);
  }, [items, userId]);

  function addItem(product, unit, quantity, unitPrice) {
    setItems((current) => {
      const existingIndex = current.findIndex(
        (item) => item.productId === product.id && item.unit === unit
      );
      if (existingIndex !== -1) {
        const updated = [...current];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          unit,
          unitPrice,
          quantity,
        },
      ];
    });
  }

  function removeItem(productId, unit) {
    setItems((current) => current.filter((item) => !(item.productId === productId && item.unit === unit)));
  }

  function updateQuantity(productId, unit, quantity) {
    if (quantity <= 0) {
      removeItem(productId, unit);
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.productId === productId && item.unit === unit ? { ...item, quantity } : item
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}

export { CartProvider, useCart };
