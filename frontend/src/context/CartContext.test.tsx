import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Cart } from "@/lib/types";

const { cartCreate, cartGet, cartAddItem, cartRemoveItem, cartClear, checkoutCreateOrder } =
  vi.hoisted(() => ({
    cartCreate: vi.fn(),
    cartGet: vi.fn(),
    cartAddItem: vi.fn(),
    cartRemoveItem: vi.fn(),
    cartClear: vi.fn(),
    checkoutCreateOrder: vi.fn(),
  }));

vi.mock("@/lib/api", () => ({
  api: {
    cart: {
      create: cartCreate,
      get: cartGet,
      addItem: cartAddItem,
      removeItem: cartRemoveItem,
      clear: cartClear,
    },
    checkout: {
      createOrder: checkoutCreateOrder,
    },
  },
}));

import { CartProvider, useCart } from "./CartContext";

function emptyCart(overrides: Partial<Cart> = {}): Cart {
  return {
    id: "cart-1",
    items: [],
    subtotal: 0,
    currency: "ARS",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("CartProvider / useCart", () => {
  it("starts with an empty local state when no cart id is stored", async () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.cart).toBeNull();
    expect(result.current.itemCount).toBe(0);
  });

  it("rehydrates the cart from localStorage on mount", async () => {
    localStorage.setItem("genaro.cartId", "cart-1");
    cartGet.mockResolvedValue(emptyCart());

    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    await waitFor(() => expect(result.current.cart?.id).toBe("cart-1"));
    expect(cartGet).toHaveBeenCalledWith("cart-1");
  });

  it("clears the stored id when rehydration fails", async () => {
    localStorage.setItem("genaro.cartId", "stale-cart");
    cartGet.mockRejectedValue(new Error("404"));

    renderHook(() => useCart(), { wrapper: CartProvider });

    await waitFor(() => expect(localStorage.getItem("genaro.cartId")).toBeNull());
  });

  it("addItem creates a cart on first use, persists the id, and opens the sidebar", async () => {
    const created = emptyCart();
    const withItem = emptyCart({
      items: [{ shoeId: "shoe-1", brand: "Genaro", model: "Colmar", size: 38, color: "marron", unitPrice: 1000, quantity: 1 }],
      subtotal: 1000,
    });
    cartCreate.mockResolvedValue(created);
    cartAddItem.mockResolvedValue(withItem);

    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addItem({ shoeId: "shoe-1", size: 38, color: "marron", quantity: 1 });
    });

    expect(cartCreate).toHaveBeenCalled();
    expect(cartAddItem).toHaveBeenCalledWith("cart-1", {
      shoeId: "shoe-1",
      size: 38,
      color: "marron",
      quantity: 1,
    });
    expect(result.current.cart?.items).toHaveLength(1);
    expect(result.current.itemCount).toBe(1);
    expect(result.current.isOpen).toBe(true);
    expect(localStorage.getItem("genaro.cartId")).toBe("cart-1");
  });

  it("addItem does not open the sidebar when options.open is false", async () => {
    cartCreate.mockResolvedValue(emptyCart());
    cartAddItem.mockResolvedValue(emptyCart());

    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addItem(
        { shoeId: "shoe-1", size: 38, color: "marron", quantity: 1 },
        { open: false },
      );
    });

    expect(result.current.isOpen).toBe(false);
  });

  it("addItem surfaces an error message and rethrows", async () => {
    cartCreate.mockResolvedValue(emptyCart());
    cartAddItem.mockRejectedValue(new Error("Insufficient stock"));

    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await expect(
        result.current.addItem({ shoeId: "shoe-1", size: 38, color: "marron", quantity: 1 }),
      ).rejects.toThrow("Insufficient stock");
    });

    expect(result.current.error).toBe("Insufficient stock");
  });

  it("updateQuantity to 0 removes the line", async () => {
    localStorage.setItem("genaro.cartId", "cart-1");
    const target = { shoeId: "shoe-1", brand: "Genaro", model: "Colmar", size: 38, color: "marron", unitPrice: 1000, quantity: 2 };
    cartGet.mockResolvedValue(emptyCart({ items: [target], subtotal: 2000 }));
    cartRemoveItem.mockResolvedValue(emptyCart());

    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => expect(result.current.cart?.items).toHaveLength(1));

    await act(async () => {
      await result.current.updateQuantity(target, 0);
    });

    expect(cartRemoveItem).toHaveBeenCalledWith("cart-1", {
      shoeId: "shoe-1",
      size: 38,
      color: "marron",
    });
    expect(result.current.cart?.items).toHaveLength(0);
  });

  it("updateQuantity increase adds only the positive delta", async () => {
    localStorage.setItem("genaro.cartId", "cart-1");
    const target = { shoeId: "shoe-1", brand: "Genaro", model: "Colmar", size: 38, color: "marron", unitPrice: 1000, quantity: 2 };
    cartGet.mockResolvedValue(emptyCart({ items: [target], subtotal: 2000 }));
    cartAddItem.mockResolvedValue(emptyCart({ items: [{ ...target, quantity: 5 }], subtotal: 5000 }));

    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => expect(result.current.cart?.items).toHaveLength(1));

    await act(async () => {
      await result.current.updateQuantity(target, 5);
    });

    expect(cartAddItem).toHaveBeenCalledWith("cart-1", {
      shoeId: "shoe-1",
      size: 38,
      color: "marron",
      quantity: 3,
    });
  });

  it("updateQuantity decrease removes then re-adds the desired quantity", async () => {
    localStorage.setItem("genaro.cartId", "cart-1");
    const target = { shoeId: "shoe-1", brand: "Genaro", model: "Colmar", size: 38, color: "marron", unitPrice: 1000, quantity: 5 };
    cartGet.mockResolvedValue(emptyCart({ items: [target], subtotal: 5000 }));
    cartRemoveItem.mockResolvedValue(emptyCart());
    cartAddItem.mockResolvedValue(emptyCart({ items: [{ ...target, quantity: 2 }], subtotal: 2000 }));

    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => expect(result.current.cart?.items).toHaveLength(1));

    await act(async () => {
      await result.current.updateQuantity(target, 2);
    });

    expect(cartRemoveItem).toHaveBeenCalledWith("cart-1", {
      shoeId: "shoe-1",
      size: 38,
      color: "marron",
    });
    expect(cartAddItem).toHaveBeenCalledWith("cart-1", {
      shoeId: "shoe-1",
      size: 38,
      color: "marron",
      quantity: 2,
    });
  });

  it("resetCart clears local state and the stored cart id", async () => {
    localStorage.setItem("genaro.cartId", "cart-1");
    cartGet.mockResolvedValue(emptyCart());

    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => expect(result.current.cart).not.toBeNull());

    act(() => result.current.resetCart());

    expect(result.current.cart).toBeNull();
    expect(localStorage.getItem("genaro.cartId")).toBeNull();
  });

  it("checkout redirects to the PayPal approve URL", async () => {
    localStorage.setItem("genaro.cartId", "cart-1");
    const item = { shoeId: "shoe-1", brand: "Genaro", model: "Colmar", size: 38, color: "marron", unitPrice: 1000, quantity: 1 };
    cartGet.mockResolvedValue(emptyCart({ items: [item], subtotal: 1000 }));
    checkoutCreateOrder.mockResolvedValue({
      order: { id: "order-1" },
      approveUrl: "https://paypal.test/approve",
    });

    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, href: "" },
    });

    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => expect(result.current.cart?.items).toHaveLength(1));

    await act(async () => {
      await result.current.checkout();
    });

    expect(window.location.href).toBe("https://paypal.test/approve");
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("checkout does nothing for an empty cart", async () => {
    localStorage.setItem("genaro.cartId", "cart-1");
    cartGet.mockResolvedValue(emptyCart());

    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.checkout();
    });

    expect(checkoutCreateOrder).not.toHaveBeenCalled();
  });
});
