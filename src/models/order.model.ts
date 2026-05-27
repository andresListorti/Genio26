import { CartItem } from './cart.model';

export type OrderStatus =
  | 'CREATED'
  | 'APPROVED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'REFUNDED';

export interface Order {
  id: string;
  cartId?: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  currency: string;
  status: OrderStatus;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  payerEmail?: string;
  createdAt: string;
  updatedAt: string;
}
