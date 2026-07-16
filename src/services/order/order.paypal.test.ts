import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Cart } from '../../models/cart.model';

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

const { createOrder, captureOrder } = vi.hoisted(() => ({
  createOrder: vi.fn(),
  captureOrder: vi.fn(),
}));
vi.mock('../paypal.service', () => ({
  paypalService: { createOrder, captureOrder },
}));

const { decrementStock } = vi.hoisted(() => ({
  decrementStock: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../shoe.service', () => ({
  shoeService: { decrementStock, releaseReservation: vi.fn() },
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
import { paypalOrders } from './order.paypal';

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
      quantity: 1,
    },
  ],
  subtotal: 1000,
  currency: 'USD',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('paypalOrders.createFromCart', () => {
  it('creates a PayPal order from the cart and returns the approve link', async () => {
    findCartById.mockResolvedValue(cart);
    createOrder.mockResolvedValue({
      id: 'PP-123',
      status: 'CREATED',
      links: [{ rel: 'approve', href: 'https://paypal.test/approve', method: 'GET' }],
    });

    const { order, approveUrl } = await paypalOrders.createFromCart('cart-1', 'user-1');

    expect(order.provider).toBe('paypal');
    expect(order.status).toBe('CREATED');
    expect(order.paypalOrderId).toBe('PP-123');
    expect(approveUrl).toBe('https://paypal.test/approve');

    const persisted = await orderRepository.findById(order.id);
    expect(persisted).toEqual(order);
  });

  it('throws when the cart does not exist', async () => {
    findCartById.mockResolvedValue(null);
    await expect(paypalOrders.createFromCart('missing-cart')).rejects.toThrow('not found');
  });

  it('throws when the cart is empty', async () => {
    findCartById.mockResolvedValue({ ...cart, items: [] });
    await expect(paypalOrders.createFromCart('cart-1')).rejects.toThrow('Cart is empty');
  });
});

describe('paypalOrders.captureOrder', () => {
  async function seedCreatedOrder() {
    findCartById.mockResolvedValue(cart);
    createOrder.mockResolvedValue({
      id: 'PP-123',
      status: 'CREATED',
      links: [{ rel: 'approve', href: 'https://paypal.test/approve', method: 'GET' }],
    });
    const { order } = await paypalOrders.createFromCart('cart-1');
    vi.clearAllMocks();
    return order;
  }

  it('fulfills the order and notifies on a completed capture', async () => {
    const order = await seedCreatedOrder();
    captureOrder.mockResolvedValue({
      id: order.paypalOrderId,
      status: 'COMPLETED',
      captureId: 'CAP-1',
      payerEmail: 'buyer@test.com',
    });

    const updated = await paypalOrders.captureOrder(order.id);

    expect(updated.status).toBe('COMPLETED');
    expect(updated.paypalCaptureId).toBe('CAP-1');
    expect(decrementStock).toHaveBeenCalledWith('shoe-1', 38, 'marron', 1);
    expect(clearCart).toHaveBeenCalledWith('cart-1');
    expect(sendOrderConfirmation).toHaveBeenCalled();
    expect(sendAdminNotification).toHaveBeenCalled();
  });

  it('does not fulfill or notify when PayPal has not approved the order', async () => {
    const order = await seedCreatedOrder();
    captureOrder.mockResolvedValue({ id: order.paypalOrderId, status: 'PENDING_APPROVAL' });

    const updated = await paypalOrders.captureOrder(order.id);

    expect(updated.status).toBe('APPROVED');
    expect(decrementStock).not.toHaveBeenCalled();
    expect(sendOrderConfirmation).not.toHaveBeenCalled();
  });

  it('throws for an unknown order id', async () => {
    await expect(paypalOrders.captureOrder('missing')).rejects.toThrow('not found');
  });

  it('throws when the order has no PayPal id', async () => {
    await orderRepository.save({
      id: 'order-no-pp',
      items: [],
      subtotal: 0,
      currency: 'USD',
      status: 'CREATED',
      provider: 'mercadopago',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await expect(paypalOrders.captureOrder('order-no-pp')).rejects.toThrow('no PayPal id');
  });
});
