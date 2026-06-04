import { CartItem } from './cart.model';

export type OrderStatus =
  | 'CREATED'
  | 'APPROVED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'REFUNDED';

export type PaymentProvider = 'paypal' | 'mercadopago';

export interface Order {
  id: string;
  cartId?: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  currency: string;
  status: OrderStatus;
  provider: PaymentProvider;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  // Mercado Pago (Checkout Bricks)
  mpPreferenceId?: string;
  mpPaymentId?: string;
  mpStatusDetail?: string;
  payerEmail?: string;
  // Shipping / buyer contact saved at order creation
  shippingAddress?: string;
  shippingPhone?: string;
  createdAt: string;
  updatedAt: string;
}
