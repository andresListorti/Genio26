import type { Cart, CheckoutResponse, Shoe } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `API ${init?.method ?? "GET"} ${path} failed (${res.status}): ${body}`,
    );
  }
  const json = (await res.json()) as { data?: T } & T;
  return (json.data ?? (json as T)) as T;
}

export const api = {
  shoes: {
    list: () => request<Shoe[]>("/api/shoes"),
    get: (id: string) => request<Shoe>(`/api/shoes/${id}`),
  },
  cart: {
    create: () =>
      request<Cart>("/api/carts", { method: "POST", body: JSON.stringify({}) }),
    get: (id: string) => request<Cart>(`/api/carts/${id}`),
    addItem: (
      id: string,
      input: { shoeId: string; size: number; color: string; quantity: number },
    ) =>
      request<Cart>(`/api/carts/${id}/items`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    removeItem: (
      id: string,
      input: { shoeId: string; size: number; color: string },
    ) =>
      request<Cart>(`/api/carts/${id}/items`, {
        method: "DELETE",
        body: JSON.stringify(input),
      }),
    clear: (id: string) =>
      request<Cart>(`/api/carts/${id}`, { method: "DELETE" }),
  },
  checkout: {
    createOrder: (cartId: string) =>
      request<CheckoutResponse>("/api/checkout/orders", {
        method: "POST",
        body: JSON.stringify({ cartId }),
      }),
  },
};
