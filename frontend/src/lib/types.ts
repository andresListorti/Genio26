export interface ShoeStockVariant {
  size: number;
  color: string;
  stock: number;
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
  category?: string;
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

export interface Order {
  id: string;
  cartId?: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  currency: string;
  status:
    | "CREATED"
    | "APPROVED"
    | "COMPLETED"
    | "CANCELLED"
    | "FAILED"
    | "REFUNDED";
  paypalOrderId?: string;
  paypalCaptureId?: string;
  payerEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutResponse {
  order: Order;
  approveUrl?: string;
}
