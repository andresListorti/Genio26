export interface ShoeStockVariant {
  size: number;
  color: string;
  stock: number;
  reserved?: number; // units held pending payment confirmation
  sku?: string;
}

export interface Shoe {
  id: string;
  brand: string;
  model: string;
  price: number;
  currency: string;
  description: string;
  imageUrl?: string;
  images?: string[];
  category?: string;
  gender: "men" | "women";
  variants: ShoeStockVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  shoeId: string;
  brand: string;
  model: string;
  size: number;
  color: string;
  unitPrice: number;
  quantity: number;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "CREATED"
  | "APPROVED"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED"
  | "REFUNDED";

export type PaymentProvider = "paypal" | "mercadopago";

export interface Order {
  id: string;
  cartId?: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  currency: string;
  status: OrderStatus;
  provider?: PaymentProvider;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  mpPreferenceId?: string;
  mpPaymentId?: string;
  mpStatusDetail?: string;
  payerEmail?: string;
  shippingAddress?: string;
  shippingPhone?: string;
  shippedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutResponse {
  order: Order;
  approveUrl?: string;
}

export interface MercadoPagoPreference {
  order: Order;
  preferenceId: string;
  publicKey: string;
}

export interface MercadoPagoProcessResult {
  order: Order;
  status: OrderStatus;
}
