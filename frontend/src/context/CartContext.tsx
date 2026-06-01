"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/lib/api";
import type { Cart } from "@/lib/types";

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (
    input: {
      shoeId: string;
      size: number;
      color: string;
      quantity: number;
    },
    options?: { open?: boolean },
  ) => Promise<void>;
  removeItem: (input: {
    shoeId: string;
    size: number;
    color: string;
  }) => Promise<void>;
  updateQuantity: (
    input: { shoeId: string; size: number; color: string; quantity: number },
    nextQuantity: number,
  ) => Promise<void>;
  clear: () => Promise<void>;
  checkout: () => Promise<void>;
}

const CART_ID_KEY = "genaro.cartId";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(CART_ID_KEY) : null;
    if (!stored) return;
    setLoading(true);
    api.cart
      .get(stored)
      .then(setCart)
      .catch(() => {
        localStorage.removeItem(CART_ID_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const ensureCart = useCallback(async (): Promise<Cart> => {
    if (cart) return cart;
    const created = await api.cart.create();
    localStorage.setItem(CART_ID_KEY, created.id);
    setCart(created);
    return created;
  }, [cart]);

  const addItem = useCallback<CartContextValue["addItem"]>(
    async (input, options) => {
      setError(null);
      setLoading(true);
      try {
        const current = await ensureCart();
        const updated = await api.cart.addItem(current.id, input);
        setCart(updated);
        // The cart page manages its own state; only auto-open the sidebar
        // when adding from the catalog/product views.
        if (options?.open !== false) setIsOpen(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add item");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [ensureCart],
  );

  const removeItem = useCallback<CartContextValue["removeItem"]>(
    async (input) => {
      if (!cart) return;
      setLoading(true);
      try {
        const updated = await api.cart.removeItem(cart.id, input);
        setCart(updated);
      } finally {
        setLoading(false);
      }
    },
    [cart],
  );

  const updateQuantity = useCallback<CartContextValue["updateQuantity"]>(
    async (input, nextQuantity) => {
      if (!cart) return;
      const target = { shoeId: input.shoeId, size: input.size, color: input.color };
      setError(null);
      setLoading(true);
      try {
        if (nextQuantity <= 0) {
          setCart(await api.cart.removeItem(cart.id, target));
          return;
        }
        const delta = nextQuantity - input.quantity;
        if (delta === 0) return;
        if (delta > 0) {
          // No backend decrement endpoint exists, so increases add the delta...
          setCart(await api.cart.addItem(cart.id, { ...target, quantity: delta }));
        } else {
          // ...and decreases clear the line and re-add the desired quantity.
          await api.cart.removeItem(cart.id, target);
          setCart(
            await api.cart.addItem(cart.id, { ...target, quantity: nextQuantity }),
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update item");
      } finally {
        setLoading(false);
      }
    },
    [cart],
  );

  const clear = useCallback(async () => {
    if (!cart) return;
    setLoading(true);
    try {
      const updated = await api.cart.clear(cart.id);
      setCart(updated);
    } finally {
      setLoading(false);
    }
  }, [cart]);

  const checkout = useCallback(async () => {
    if (!cart || cart.items.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const { approveUrl } = await api.checkout.createOrder(cart.id);
      if (approveUrl) {
        window.location.href = approveUrl;
      } else {
        setError("PayPal did not return an approval link");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }, [cart]);

  const itemCount = useMemo(
    () => cart?.items.reduce((acc, i) => acc + i.quantity, 0) ?? 0,
    [cart],
  );

  const value: CartContextValue = {
    cart,
    loading,
    error,
    itemCount,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addItem,
    removeItem,
    updateQuantity,
    clear,
    checkout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
