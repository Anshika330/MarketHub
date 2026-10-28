import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { getCatalog } from '../services/productStorage';

const CART_STORAGE_KEY = 'markethub-cart';
const CartContext = createContext(null);

function storageKeyForUser(user) {
  return user?.id ? `${CART_STORAGE_KEY}:${user.role}:${user.id}` : `${CART_STORAGE_KEY}:guest`;
}

function readStoredCart(storageKey) {
  try {
    const storedCart = JSON.parse(localStorage.getItem(storageKey));

    if (!Array.isArray(storedCart)) {
      return [];
    }

    return storedCart
      .filter(
        (item) =>
          item &&
          typeof item.productId === 'string' &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0 &&
          (item.product ||
            getCatalog().some((product) => product.id === item.productId)),
      )
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        product: item.product || undefined,
      }));
  } catch {
    return [];
  }
}

function CartProvider({ children }) {
  const { currentUser } = useAuth();
  const cartStorageKey = storageKeyForUser(currentUser);
  const [storedCart, setStoredCart] = useState(() => ({
    key: cartStorageKey,
    items: readStoredCart(cartStorageKey),
  }));

  useEffect(() => {
    setStoredCart({
      key: cartStorageKey,
      items: readStoredCart(cartStorageKey),
    });
  }, [cartStorageKey]);

  const cartItems = storedCart.key === cartStorageKey ? storedCart.items : [];

  useEffect(() => {
    if (storedCart.key !== cartStorageKey) {
      return;
    }

    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(storedCart.items));
    } catch {
      // Cart state still works for the current session if storage is unavailable.
    }
  }, [cartStorageKey, storedCart]);

  const updateCartItems = (update) => {
    setStoredCart((currentCart) => {
      const currentItems = currentCart.key === cartStorageKey
        ? currentCart.items
        : readStoredCart(cartStorageKey);
      return {
        key: cartStorageKey,
        items: update(currentItems),
      };
    });
  };

  const addToCart = (product) => {
    updateCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.productId === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, product }
            : item,
        );
      }

      return [...currentItems, { productId: product.id, quantity: 1, product }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    updateCartItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item,
      ),
    );
  };

  const removeFromCart = (productId) => {
    updateCartItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId),
    );
  };

  const clearCart = () => {
    updateCartItems(() => []);
  };

  const cartProducts = useMemo(
    () =>
      cartItems
        .map((item) => {
          const product =
            item.product || getCatalog().find((entry) => entry.id === item.productId);
          return product ? { ...product, quantity: item.quantity } : null;
        })
        .filter(Boolean),
    [cartItems],
  );

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cartProducts.reduce(
    (total, product) => total + product.price * product.quantity,
    0,
  );

  const value = {
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartProducts,
    itemCount,
    cartSubtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}

export { CartProvider, useCart };
