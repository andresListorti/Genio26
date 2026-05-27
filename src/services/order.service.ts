import { v4 as uuidv4 } from 'uuid';
import { firestore, collections } from '../config/firebase';
import { Order, OrderStatus } from '../models/order.model';
import { Cart } from '../models/cart.model';
import { cartService } from './cart.service';
import { paypalService } from './paypal.service';
import { shoeService } from './shoe.service';

const ordersCollection = () => firestore.collection(collections.orders);

export const orderService = {
  async createFromCart(cartId: string, userId?: string): Promise<{
    order: Order;
    approveUrl?: string;
  }> {
    const cart = await cartService.findById(cartId);
    if (!cart) throw new Error(`Cart ${cartId} not found`);
    if (cart.items.length === 0) throw new Error('Cart is empty');

    const paypalOrder = await paypalService.createOrder(cart);

    const id = uuidv4();
    const now = new Date().toISOString();
    const order: Order = {
      id,
      cartId: cart.id,
      userId: userId ?? cart.userId,
      items: cart.items,
      subtotal: cart.subtotal,
      currency: cart.currency,
      status: 'CREATED',
      paypalOrderId: paypalOrder.id,
      createdAt: now,
      updatedAt: now,
    };
    await ordersCollection().doc(id).set(order);

    const approveUrl = paypalOrder.links.find((l) => l.rel === 'approve')?.href;
    return { order, approveUrl };
  },

  async findById(id: string): Promise<Order | null> {
    const doc = await ordersCollection().doc(id).get();
    return doc.exists ? (doc.data() as Order) : null;
  },

  async findByPaypalOrderId(paypalOrderId: string): Promise<Order | null> {
    const snap = await ordersCollection()
      .where('paypalOrderId', '==', paypalOrderId)
      .limit(1)
      .get();
    if (snap.empty) return null;
    return snap.docs[0].data() as Order;
  },

  async captureOrder(orderId: string): Promise<Order> {
    const order = await this.findById(orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);
    if (!order.paypalOrderId) throw new Error('Order has no PayPal id');

    const result = await paypalService.captureOrder(order.paypalOrderId);
    const status: OrderStatus =
      result.status === 'COMPLETED' ? 'COMPLETED' : 'APPROVED';

    if (status === 'COMPLETED') {
      for (const item of order.items) {
        await shoeService.decrementStock(
          item.shoeId,
          item.size,
          item.color,
          item.quantity,
        );
      }
      if (order.cartId) {
        await cartService.clear(order.cartId).catch(() => undefined);
      }
    }

    const updated: Order = {
      ...order,
      status,
      paypalCaptureId: result.captureId,
      payerEmail: result.payerEmail,
      updatedAt: new Date().toISOString(),
    };
    await ordersCollection().doc(order.id).set(updated);
    return updated;
  },

  async updateStatusByPaypalId(
    paypalOrderId: string,
    status: OrderStatus,
    extra: Partial<Order> = {},
  ): Promise<Order | null> {
    const order = await this.findByPaypalOrderId(paypalOrderId);
    if (!order) return null;
    const updated: Order = {
      ...order,
      ...extra,
      status,
      updatedAt: new Date().toISOString(),
    };
    await ordersCollection().doc(order.id).set(updated);
    return updated;
  },
};
