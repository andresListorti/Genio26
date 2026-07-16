import { v4 as uuidv4 } from 'uuid';
import { Order, OrderStatus } from '../../models/order.model';
import { cartService } from '../cart.service';
import { paypalService } from '../paypal.service';
import { orderRepository } from './order.repository';
import { fulfillOrder, notifyOrderCompleted } from './order.fulfillment';

export const paypalOrders = {
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
      provider: 'paypal',
      paypalOrderId: paypalOrder.id,
      createdAt: now,
      updatedAt: now,
    };
    await orderRepository.save(order);

    const approveUrl = paypalOrder.links.find((l) => l.rel === 'approve')?.href;
    return { order, approveUrl };
  },

  async captureOrder(orderId: string): Promise<Order> {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);
    if (!order.paypalOrderId) throw new Error('Order has no PayPal id');

    const result = await paypalService.captureOrder(order.paypalOrderId);
    const status: OrderStatus =
      result.status === 'COMPLETED' ? 'COMPLETED' : 'APPROVED';

    if (status === 'COMPLETED') {
      await fulfillOrder(order);
    }

    const updated: Order = {
      ...order,
      status,
      paypalCaptureId: result.captureId,
      payerEmail: result.payerEmail,
      updatedAt: new Date().toISOString(),
    };
    await orderRepository.save(updated);

    if (status === 'COMPLETED') {
      notifyOrderCompleted(updated);
    }

    return updated;
  },
};
