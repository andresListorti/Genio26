import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Order } from '../../models/order.model';
import { CartItem } from '../../models/cart.model';

vi.mock('../../config/firebase', async () => {
  const fake = await import('../../test-utils/fakeFirestore');
  return { firestore: fake.firestore, collections: fake.collections };
});

const { decrementStock, releaseReservation } = vi.hoisted(() => ({
  decrementStock: vi.fn().mockResolvedValue(undefined),
  releaseReservation: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../shoe.service', () => ({
  shoeService: { decrementStock, releaseReservation },
}));

const { clear } = vi.hoisted(() => ({ clear: vi.fn().mockResolvedValue(undefined) }));
vi.mock('../cart.service', () => ({
  cartService: { clear },
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
import {
  cleanupPendingOrders,
  fulfillOrder,
  notifyOrderCompleted,
  releaseOrderReservations,
} from './order.fulfillment';

beforeEach(() => {
  resetFakeFirestore();
  vi.clearAllMocks();
});

const item: CartItem = {
  shoeId: 'shoe-1',
  brand: 'Genaro',
  model: 'Colmar',
  size: 38,
  color: 'marron',
  unitPrice: 1000,
  quantity: 2,
};

function makeOrder(overrides: Partial<Order> = {}): Order {
  const now = new Date().toISOString();
  return {
    id: 'order-1',
    cartId: 'cart-1',
    items: [item],
    subtotal: 2000,
    currency: 'ARS',
    status: 'CREATED',
    provider: 'mercadopago',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('fulfillOrder', () => {
  it('decrements stock for every item and clears the cart', async () => {
    const order = makeOrder();
    await fulfillOrder(order);

    expect(decrementStock).toHaveBeenCalledWith('shoe-1', 38, 'marron', 2);
    expect(clear).toHaveBeenCalledWith('cart-1');
  });

  it('skips clearing the cart when the order has no cartId', async () => {
    const order = makeOrder({ cartId: undefined });
    await fulfillOrder(order);

    expect(clear).not.toHaveBeenCalled();
  });

  it('does not let a cart-clear failure reject the call', async () => {
    clear.mockRejectedValueOnce(new Error('firestore down'));
    await expect(fulfillOrder(makeOrder())).resolves.toBeUndefined();
  });
});

describe('releaseOrderReservations', () => {
  it('releases the reservation for every item', async () => {
    await releaseOrderReservations(makeOrder());
    expect(releaseReservation).toHaveBeenCalledWith('shoe-1', 38, 'marron', 2);
  });

  it('does not throw when a release fails', async () => {
    releaseReservation.mockRejectedValueOnce(new Error('boom'));
    await expect(releaseOrderReservations(makeOrder())).resolves.toBeUndefined();
  });
});

describe('notifyOrderCompleted', () => {
  it('fires both notification emails', () => {
    notifyOrderCompleted(makeOrder());
    expect(sendOrderConfirmation).toHaveBeenCalled();
    expect(sendAdminNotification).toHaveBeenCalled();
  });
});

describe('cleanupPendingOrders', () => {
  it('deletes CREATED orders for the cart and releases their reservations', async () => {
    await orderRepository.save(makeOrder({ id: 'order-1', cartId: 'cart-A', status: 'CREATED' }));
    await orderRepository.save(makeOrder({ id: 'order-2', cartId: 'cart-A', status: 'COMPLETED' }));

    await cleanupPendingOrders('cart-A');

    expect(await orderRepository.findById('order-1')).toBeNull();
    expect(await orderRepository.findById('order-2')).not.toBeNull();
    expect(releaseReservation).toHaveBeenCalledTimes(1);
  });

  it('does nothing when there are no orders for the cart', async () => {
    await cleanupPendingOrders('no-such-cart');
    expect(releaseReservation).not.toHaveBeenCalled();
  });

  it('does nothing when the only orders are not CREATED', async () => {
    await orderRepository.save(makeOrder({ id: 'order-1', cartId: 'cart-A', status: 'COMPLETED' }));
    await cleanupPendingOrders('cart-A');
    expect(await orderRepository.findById('order-1')).not.toBeNull();
  });
});
