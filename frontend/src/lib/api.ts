import type {
  Cart,
  CheckoutResponse,
  MercadoPagoPreference,
  MercadoPagoProcessResult,
  PublicOrder,
  Shoe,
} from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

/** Firebase ID token header for endpoints that require a signed-in buyer. */
async function authHeaders(): Promise<Record<string, string>> {
  const { auth } = await import("./firebase");
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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
    list: (opts?: { gender?: "men" | "women" }) =>
      request<Shoe[]>(
        opts?.gender ? `/api/shoes?gender=${opts.gender}` : "/api/shoes",
      ),
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
    // Whether the store is open for payments (backend CHECKOUT_ENABLED switch).
    status: () =>
      request<{ enabled: boolean; paypal: boolean }>("/api/checkout/status"),
    // PayPal
    createOrder: (cartId: string) =>
      request<CheckoutResponse>("/api/checkout/orders", {
        method: "POST",
        body: JSON.stringify({ cartId }),
      }),
    // Order lookup — used by the checkout result pages to confirm the outcome.
    getOrder: (orderId: string) =>
      request<PublicOrder>(`/api/checkout/orders/${orderId}`),
    // Mercado Pago (Checkout Bricks — seamless, in-app)
    mercadopago: {
      createPreference: (input: {
        cartId: string;
        userId?: string;
        payerEmail?: string;
        payerName?: string;
        shippingAddress?: string;
        shippingPhone?: string;
      }) =>
        authHeaders().then((headers) =>
          request<MercadoPagoPreference>("/api/checkout/mercadopago", {
            method: "POST",
            headers,
            body: JSON.stringify(input),
          }),
        ),
      process: (orderId: string, formData: unknown) =>
        authHeaders().then((headers) =>
          request<MercadoPagoProcessResult>(
            "/api/checkout/mercadopago/process",
            {
              method: "POST",
              headers,
              body: JSON.stringify({ orderId, formData }),
            },
          ),
        ),
      // Called from the success/pending redirect URL to persist final status.
      confirm: (paymentId: string) =>
        request<PublicOrder>("/api/checkout/mercadopago/confirm", {
          method: "POST",
          body: JSON.stringify({ paymentId }),
        }),
    },
  },
};
