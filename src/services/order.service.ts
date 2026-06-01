import { v4 as uuidv4 } from 'uuid';
import { firestore, collections } from '../config/firebase';
import { Order, OrderStatus } from '../models/order.model';
import { env } from '../config/env';
import { cartService } from './cart.service';
import { paypalService } from './paypal.service';
import {
  mercadoPagoService,
  MercadoPagoBrickFormData,
  MercadoPagoPaymentResult,
} from './mercadopago.service';
import { shoeService } from './shoe.service';

const ordersCollection = () => firestore.collection(collections.orders);

/** Maps a Mercado Pago payment status onto our internal order status. */
function mapMercadoPagoStatus(mpStatus: string): OrderStatus {
  switch (mpStatus) {
    case 'approved':
      return 'COMPLETED';
    case 'authorized':
    case 'in_process':
    case 'pending':
      return 'APPROVED';
    case 'refunded':
    case 'charged_back':
      return 'REFUNDED';
    case 'cancelled':
    case 'rejected':
    default:
      return 'FAILED';
  }
}

/** Decrements stock for every line and clears the originating cart. */
async function fulfillOrder(order: Order): Promise<void> {
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
      provider: 'paypal',
      paypalOrderId: paypalOrder.id,
      createdAt: now,
      updatedAt: now,
    };
    await ordersCollection().doc(id).set(order);

    const approveUrl = paypalOrder.links.find((l) => l.rel === 'approve')?.href;
    return { order, approveUrl };
  },

  /**
   * Creates a Mercado Pago order + Checkout preference for the cart. The
   * returned preferenceId/publicKey drive the in-app Payment Brick.
   */
  async createMercadoPagoFromCart(
    cartId: string,
    userId?: string,
  ): Promise<{ order: Order; preferenceId: string; publicKey: string }> {
    const cart = await cartService.findById(cartId);
    if (!cart) throw new Error(`Cart ${cartId} not found`);
    if (cart.items.length === 0) throw new Error('Cart is empty');

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
      provider: 'mercadopago',
      createdAt: now,
      updatedAt: now,
    };

    const preferenceId = await mercadoPagoService.createPreference(order, cart);
    order.mpPreferenceId = preferenceId;
    await ordersCollection().doc(id).set(order);

    return {
      order,
      preferenceId,
      publicKey: env.mercadopago.publicKey,
    };
  },

  /**
   * Processes the Payment Brick submission for an existing Mercado Pago order.
   * On approval, fulfills the order (stock + cart clear).
   */
  async processMercadoPagoPayment(
    orderId: string,
    formData: MercadoPagoBrickFormData,
  ): Promise<Order> {
    const order = await this.findById(orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);
    if (order.provider !== 'mercadopago') {
      throw new Error(`Order ${orderId} is not a Mercado Pago order`);
    }

    const payment = await mercadoPagoService.createPayment(order, formData);
    return this.applyMercadoPagoPayment(order, payment);
  },

  /**
   * Applies a Mercado Pago payment outcome to an order and persists it. Fulfills
   * (decrement stock + clear cart) exactly once, on the transition INTO
   * COMPLETED — so the seamless Brick path and the async webhook can both call
   * this for the same payment without double-fulfilling.
   */
  async applyMercadoPagoPayment(
    order: Order,
    payment: MercadoPagoPaymentResult,
  ): Promise<Order> {
    const status = mapMercadoPagoStatus(payment.status);
    if (status === 'COMPLETED' && order.status !== 'COMPLETED') {
      await fulfillOrder(order);
    }

    const updated: Order = {
      ...order,
      status,
      mpPaymentId: payment.id || order.mpPaymentId,
      mpStatusDetail: payment.statusDetail,
      payerEmail: payment.payerEmail ?? order.payerEmail,
      updatedAt: new Date().toISOString(),
    };
    await ordersCollection().doc(order.id).set(updated);
    return updated;
  },

  /**
   * Resolves a Mercado Pago payment-notification webhook: fetches the payment,
   * locates the order via external_reference, and applies the outcome. Returns
   * null when the payment can't be tied to a Mercado Pago order (ignored).
   */
  async handleMercadoPagoWebhook(paymentId: string): Promise<Order | null> {
    const payment = await mercadoPagoService.getPayment(paymentId);
    const orderId = payment.externalReference;
    if (!orderId) return null;
    const order = await this.findById(orderId);
    if (!order || order.provider !== 'mercadopago') return null;
    return this.applyMercadoPagoPayment(order, payment);
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
