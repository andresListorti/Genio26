import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Cart } from '../../models/cart.model';
import { Order } from '../../models/order.model';

vi.mock('../../config/firebase', async () => {
  const fake = await import('../../test-utils/fakeFirestore');
  return { firestore: fake.firestore, collections: fake.collections };
});

const { findCartById, clearCart } = vi.hoisted(() => ({
  findCartById: vi.fn(),
  clearCart: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../cart.service', () => ({
  cartService: { findById: findCartById, clear: clearCart },
}));

const { reserveStock, decrementStock, releaseReservation } = vi.hoisted(() => ({
  reserveStock: vi.fn().mockResolvedValue(undefined),
  decrementStock: vi.fn().mockResolvedValue(undefined),
  releaseReservation: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../shoe.service', () => ({
  shoeService: { reserveStock, decrementStock, releaseReservation },
}));

const { createPreference, createPayment, getPayment } = vi.hoisted(() => ({
  createPreference: vi.fn(),
  createPayment: vi.fn(),
  getPayment: vi.fn(),
}));
vi.mock('../mercadopago.service', () => ({
  mercadoPagoService: { createPreference, createPayment, getPayment },
}));

const { sendOrderConfirmation, sendAdminNotification } = vi.hoisted(() => ({
  sendOrderConfirmation: vi.fn().mockResolvedValue(undefined),
  sendAdminNotification: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../email.service', () => ({
  emailService: { sendOrderConfirmation, sendAdminNotification },
}));

import { resetFakeFirestore } from '../../test-utils/fakeFirestore';
import { orderRepository } from './order.repository';
import { mercadoPagoOrders } from './order.mercadopago';

beforeEach(() => {
  resetFakeFirestore();
  vi.clearAllMocks();
});

const cart: Cart = {
  id: 'cart-1',
  items: [
    {
      shoeId: 'shoe-1',
      brand: 'Genaro',
      model: 'Colmar',
      size: 38,
      color: 'marron',
      unitPrice: 1000,
      quantity: 2,
    },
  ],
  subtotal: 2000,
  currency: 'ARS',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function makeOrder(overrides: Partial<Order> = {}): Order {
  const now = new Date().toISOString();
  return {
    id: 'order-1',
    cartId: 'cart-1',
    items: cart.items,
    subtotal: 2000,
    currency: 'ARS',
    status: 'CREATED',
    provider: 'mercadopago',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('mercadoPagoOrders.createMercadoPagoFromCart', () => {
  it('reserves stock, creates a preference and persists the order', async () => {
    findCartById.mockResolvedValue(cart);
    createPreference.mockResolvedValue('pref-123');

    const result = await mercadoPagoOrders.createMercadoPagoFromCart('cart-1', {
      payerEmail: 'buyer@test.com',
      shippingAddress: 'Calle Falsa 123',
      shippingPhone: '11-2233',
    });

    expect(reserveStock).toHaveBeenCalledWith('shoe-1', 38, 'marron', 2);
    expect(result.preferenceId).toBe('pref-123');
    expect(result.order.mpPreferenceId).toBe('pref-123');
    expect(result.order.shippingAddress).toBe('Calle Falsa 123');

    const persisted = await orderRepository.findById(result.order.id);
    expect(persisted?.mpPreferenceId).toBe('pref-123');
  });

  it('throws when the cart is empty and does not reserve stock', async () => {
    findCartById.mockResolvedValue({ ...cart, items: [] });
    await expect(
      mercadoPagoOrders.createMercadoPagoFromCart('cart-1'),
    ).rejects.toThrow('Cart is empty');
    expect(reserveStock).not.toHaveBeenCalled();
  });

  it('propagates a reservation failure without creating the order', async () => {
    findCartById.mockResolvedValue(cart);
    reserveStock.mockRejectedValue(new Error('Insufficient available stock'));

    await expect(
      mercadoPagoOrders.createMercadoPagoFromCart('cart-1'),
    ).rejects.toThrow('Insufficient available stock');
    expect(createPreference).not.toHaveBeenCalled();
  });
});

describe('mercadoPagoOrders.applyMercadoPagoPayment', () => {
  it('fulfills the order exactly once on the CREATED -> COMPLETED transition', async () => {
    const order = makeOrder({ status: 'CREATED' });
    await orderRepository.save(order);

    const updated = await mercadoPagoOrders.applyMercadoPagoPayment(order, {
      id: 'pay-1',
      status: 'approved',
      payerEmail: 'buyer@test.com',
    });

    expect(updated.status).toBe('COMPLETED');
    expect(decrementStock).toHaveBeenCalledWith('shoe-1', 38, 'marron', 2);
    expect(clearCart).toHaveBeenCalledWith('cart-1');
    expect(sendOrderConfirmation).toHaveBeenCalled();
    expect(sendAdminNotification).toHaveBeenCalled();
  });

  it('does not re-fulfill or re-notify when the order was already COMPLETED', async () => {
    const order = makeOrder({ status: 'COMPLETED' });
    await orderRepository.save(order);

    await mercadoPagoOrders.applyMercadoPagoPayment(order, {
      id: 'pay-1',
      status: 'approved',
    });

    expect(decrementStock).not.toHaveBeenCalled();
    expect(sendOrderConfirmation).not.toHaveBeenCalled();
  });

  it.each([
    ['authorized', 'APPROVED'],
    ['in_process', 'APPROVED'],
    ['pending', 'APPROVED'],
    ['cancelled', 'FAILED'],
    ['rejected', 'FAILED'],
    ['refunded', 'REFUNDED'],
    ['charged_back', 'REFUNDED'],
  ] as const)('maps Mercado Pago status "%s" to order status "%s"', async (mpStatus, expected) => {
    const order = makeOrder({ status: 'CREATED' });
    await orderRepository.save(order);

    const updated = await mercadoPagoOrders.applyMercadoPagoPayment(order, {
      id: 'pay-1',
      status: mpStatus,
    });

    expect(updated.status).toBe(expected);
  });

  it('releases the stock reservation on FAILED from CREATED', async () => {
    const order = makeOrder({ status: 'CREATED' });
    await orderRepository.save(order);

    await mercadoPagoOrders.applyMercadoPagoPayment(order, { id: 'pay-1', status: 'rejected' });

    expect(releaseReservation).toHaveBeenCalledWith('shoe-1', 38, 'marron', 2);
    expect(decrementStock).not.toHaveBeenCalled();
  });

  it('does not release a reservation for a FAILED payment on a non-CREATED order', async () => {
    const order = makeOrder({ status: 'APPROVED' });
    await orderRepository.save(order);

    await mercadoPagoOrders.applyMercadoPagoPayment(order, { id: 'pay-1', status: 'rejected' });

    expect(releaseReservation).not.toHaveBeenCalled();
  });
});

describe('mercadoPagoOrders.processMercadoPagoPayment', () => {
  it('creates the payment and applies the outcome', async () => {
    const order = makeOrder({ status: 'CREATED' });
    await orderRepository.save(order);
    createPayment.mockResolvedValue({ id: 'pay-1', status: 'approved' });

    const updated = await mercadoPagoOrders.processMercadoPagoPayment(order.id, {
      payment_method_id: 'visa',
      token: 'tok-1',
    });

    expect(updated.status).toBe('COMPLETED');
    expect(decrementStock).toHaveBeenCalled();
  });

  it('throws for an unknown order', async () => {
    await expect(
      mercadoPagoOrders.processMercadoPagoPayment('missing', { payment_method_id: 'visa' }),
    ).rejects.toThrow('not found');
  });

  it('throws when the order is not a Mercado Pago order', async () => {
    await orderRepository.save(makeOrder({ id: 'pp-order', provider: 'paypal' }));
    await expect(
      mercadoPagoOrders.processMercadoPagoPayment('pp-order', { payment_method_id: 'visa' }),
    ).rejects.toThrow('is not a Mercado Pago order');
  });
});

describe('mercadoPagoOrders.handleMercadoPagoWebhook', () => {
  it('resolves the order via external_reference and applies the payment', async () => {
    const order = makeOrder({ status: 'CREATED' });
    await orderRepository.save(order);
    getPayment.mockResolvedValue({
      id: 'pay-1',
      status: 'approved',
      externalReference: order.id,
    });

    const updated = await mercadoPagoOrders.handleMercadoPagoWebhook('pay-1');

    expect(updated?.status).toBe('COMPLETED');
  });

  it('returns null when the payment has no external_reference', async () => {
    getPayment.mockResolvedValue({ id: 'pay-1', status: 'approved' });
    const result = await mercadoPagoOrders.handleMercadoPagoWebhook('pay-1');
    expect(result).toBeNull();
  });

  it('returns null when the referenced order is not a Mercado Pago order', async () => {
    await orderRepository.save(makeOrder({ id: 'pp-order', provider: 'paypal' }));
    getPayment.mockResolvedValue({
      id: 'pay-1',
      status: 'approved',
      externalReference: 'pp-order',
    });

    const result = await mercadoPagoOrders.handleMercadoPagoWebhook('pay-1');
    expect(result).toBeNull();
  });

  it('returns null when the referenced order does not exist', async () => {
    getPayment.mockResolvedValue({
      id: 'pay-1',
      status: 'approved',
      externalReference: 'missing-order',
    });
    const result = await mercadoPagoOrders.handleMercadoPagoWebhook('pay-1');
    expect(result).toBeNull();
  });
});
