import { randomUUID } from 'crypto';
import { env } from '../../config/env';
import { Order, OrderStatus } from '../../models/order.model';
import { cartService } from '../cart.service';
import { shoeService } from '../shoe.service';
import {
  mercadoPagoService,
  MercadoPagoBrickFormData,
  MercadoPagoPaymentResult,
} from '../mercadopago.service';
import { orderRepository } from './order.repository';
import { HttpError } from '../../middlewares/error.middleware';
import {
  fulfillOrder,
  releaseOrderReservations,
  notifyOrderCompleted,
} from './order.fulfillment';

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

/**
 * How long a started-but-unpaid Mercado Pago order may hold stock. After this
 * the reservation is released and the order marked FAILED / "expired"; the
 * MP preference expires at the same moment so it can't be paid late.
 */
export const RESERVATION_TTL_MS = 30 * 60 * 1000;

export const mercadoPagoOrders = {
  /**
   * Releases the stock held by Mercado Pago orders that were started but never
   * paid within RESERVATION_TTL_MS. Runs lazily before each new checkout, so no
   * scheduler is needed. APPROVED (in-bank / pending) orders are never touched.
   */
  async expireStaleMercadoPagoOrders(now: number = Date.now()): Promise<number> {
    const stale = (await orderRepository.findByStatus('CREATED')).filter(
      (o) =>
        o.provider === 'mercadopago' &&
        now - new Date(o.createdAt).getTime() > RESERVATION_TTL_MS,
    );
    for (const order of stale) {
      await releaseOrderReservations(order);
      await orderRepository.save({
        ...order,
        status: 'FAILED',
        mpStatusDetail: 'expired',
        updatedAt: new Date(now).toISOString(),
      });
    }
    return stale.length;
  },

  /**
   * Creates a Mercado Pago order + Checkout preference for the cart. The
   * returned preferenceId/publicKey drive the in-app Payment Brick.
   *
   * Reserves stock for all items so no other buyer can claim the same units
   * while this payment is in flight.
   */
  async createMercadoPagoFromCart(
    cartId: string,
    options?: {
      userId?: string;
      payerEmail?: string;
      payerName?: string;
      shippingAddress?: string;
      shippingPhone?: string;
    },
  ): Promise<{ order: Order; preferenceId: string; publicKey: string }> {
    const cart = await cartService.findById(cartId);
    if (!cart) throw new Error(`Cart ${cartId} not found`);
    if (cart.items.length === 0) throw new Error('Cart is empty');

    // Free stock held by abandoned checkouts first, so it's available again.
    await this.expireStaleMercadoPagoOrders().catch((err) =>
      console.error('[mercadopago] expiring stale orders failed:', err),
    );

    // Reserve stock before creating the order so we fail fast on unavailability
    for (const item of cart.items) {
      await shoeService.reserveStock(
        item.shoeId,
        item.size,
        item.color,
        item.quantity,
      );
    }

    const id = randomUUID();
    const now = new Date().toISOString();
    const order: Order = {
      id,
      cartId: cart.id,
      userId: options?.userId ?? cart.userId,
      items: cart.items,
      subtotal: cart.subtotal,
      currency: cart.currency,
      status: 'CREATED',
      provider: 'mercadopago',
      ...(options?.shippingAddress ? { shippingAddress: options.shippingAddress } : {}),
      ...(options?.shippingPhone ? { shippingPhone: options.shippingPhone } : {}),
      ...(options?.payerEmail ? { payerEmail: options.payerEmail } : {}),
      createdAt: now,
      updatedAt: now,
    };

    const preferenceId = await mercadoPagoService.createPreference(order, cart, {
      email: options?.payerEmail,
      name: options?.payerName,
    });
    order.mpPreferenceId = preferenceId;
    await orderRepository.save(order);

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
    userId?: string,
  ): Promise<Order> {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);
    if (order.provider !== 'mercadopago') {
      throw new Error(`Order ${orderId} is not a Mercado Pago order`);
    }
    if (userId !== undefined && order.userId !== userId) {
      throw new HttpError(403, 'Este pedido no pertenece a tu cuenta.');
    }
    // Only a freshly started order can be charged: an expired, rejected or
    // already-paid one must go back through the cart (new order + reservation).
    const expired =
      Date.now() - new Date(order.createdAt).getTime() > RESERVATION_TTL_MS;
    if (order.status !== 'CREATED' || expired) {
      throw new HttpError(
        409,
        'Este pedido ya no se puede pagar. Volvé al carrito para iniciar el pago de nuevo.',
      );
    }

    const payment = await mercadoPagoService.createPayment(order, formData);
    return this.applyMercadoPagoPayment(order, payment);
  },

  /**
   * Applies a Mercado Pago payment outcome to an order and persists it. Fulfills
   * (decrement stock + clear cart) exactly once, on the transition INTO
   * COMPLETED — so the seamless Brick path and the async webhook can both call
   * this for the same payment without double-fulfilling.
   *
   * On FAILED/REFUNDED: releases the previously-held stock reservation.
   */
  async applyMercadoPagoPayment(
    order: Order,
    payment: MercadoPagoPaymentResult,
  ): Promise<Order> {
    let status = mapMercadoPagoStatus(payment.status);
    let statusDetail = payment.statusDetail;
    const wasCompleted = order.status === 'COMPLETED';

    // Never fulfill an underpaid order: an approved payment must cover the
    // order total. Marked FAILED (visible in /admin/archive) for a refund.
    const underpaid =
      typeof payment.transactionAmount === 'number' &&
      payment.transactionAmount + 0.01 < Number(order.subtotal);
    if (status === 'COMPLETED' && !wasCompleted && underpaid) {
      console.error(
        `[mercadopago] payment ${payment.id} charged ${payment.transactionAmount} ` +
          `but order ${order.id} totals ${order.subtotal} — not fulfilled`,
      );
      status = 'FAILED';
      statusDetail = 'amount_mismatch';
    }

    if (status === 'COMPLETED' && !wasCompleted) {
      // decrementStock also clears the matching reservation
      await fulfillOrder(order);
    } else if (
      (status === 'FAILED' || status === 'REFUNDED') &&
      order.status === 'CREATED'
    ) {
      await releaseOrderReservations(order);
    }

    const updated: Order = {
      ...order,
      status,
      mpPaymentId: payment.id || order.mpPaymentId,
      mpStatusDetail: statusDetail,
      payerEmail: payment.payerEmail ?? order.payerEmail,
      updatedAt: new Date().toISOString(),
    };
    await orderRepository.save(updated);

    if (status === 'COMPLETED' && !wasCompleted) {
      notifyOrderCompleted(updated);
    }

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
    const order = await orderRepository.findById(orderId);
    if (!order || order.provider !== 'mercadopago') return null;
    return this.applyMercadoPagoPayment(order, payment);
  },
};
