import { v4 as uuidv4 } from 'uuid';
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

export const mercadoPagoOrders = {
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

    // Reserve stock before creating the order so we fail fast on unavailability
    for (const item of cart.items) {
      await shoeService.reserveStock(
        item.shoeId,
        item.size,
        item.color,
        item.quantity,
      );
    }

    const id = uuidv4();
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
  ): Promise<Order> {
    const order = await orderRepository.findById(orderId);
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
   *
   * On FAILED/REFUNDED: releases the previously-held stock reservation.
   */
  async applyMercadoPagoPayment(
    order: Order,
    payment: MercadoPagoPaymentResult,
  ): Promise<Order> {
    const status = mapMercadoPagoStatus(payment.status);
    const wasCompleted = order.status === 'COMPLETED';

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
      mpStatusDetail: payment.statusDetail,
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
