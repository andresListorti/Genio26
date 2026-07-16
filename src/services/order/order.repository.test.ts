import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Order } from '../../models/order.model';

vi.mock('../../config/firebase', async () => {
  const fake = await import('../../test-utils/fakeFirestore');
  return { firestore: fake.firestore, collections: fake.collections };
});

import { resetFakeFirestore } from '../../test-utils/fakeFirestore';
import { orderRepository } from './order.repository';

beforeEach(() => {
  resetFakeFirestore();
});

function makeOrder(overrides: Partial<Order> = {}): Order {
  const now = new Date().toISOString();
  return {
    id: 'order-1',
    cartId: 'cart-1',
    items: [],
    subtotal: 100,
    currency: 'ARS',
    status: 'CREATED',
    provider: 'paypal',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('orderRepository', () => {
  it('save + findById round-trips an order', async () => {
    const order = makeOrder();
    await orderRepository.save(order);

    const found = await orderRepository.findById('order-1');
    expect(found).toEqual(order);
  });

  it('findById returns null for a missing order', async () => {
    const found = await orderRepository.findById('does-not-exist');
    expect(found).toBeNull();
  });

  it('findByPaypalOrderId finds an order by its PayPal id', async () => {
    await orderRepository.save(makeOrder({ id: 'order-1', paypalOrderId: 'PP-1' }));
    await orderRepository.save(makeOrder({ id: 'order-2', paypalOrderId: 'PP-2' }));

    const found = await orderRepository.findByPaypalOrderId('PP-2');
    expect(found?.id).toBe('order-2');
  });

  it('findByPaypalOrderId returns null when no order matches', async () => {
    const found = await orderRepository.findByPaypalOrderId('unknown');
    expect(found).toBeNull();
  });

  it('findByCartId returns all orders for a cart', async () => {
    await orderRepository.save(makeOrder({ id: 'order-1', cartId: 'cart-A' }));
    await orderRepository.save(makeOrder({ id: 'order-2', cartId: 'cart-A' }));
    await orderRepository.save(makeOrder({ id: 'order-3', cartId: 'cart-B' }));

    const found = await orderRepository.findByCartId('cart-A');
    expect(found.map((o) => o.id).sort()).toEqual(['order-1', 'order-2']);
  });

  it('deleteById removes the order', async () => {
    await orderRepository.save(makeOrder());
    await orderRepository.deleteById('order-1');

    expect(await orderRepository.findById('order-1')).toBeNull();
  });

  it('updateStatusByPaypalId updates status and merges extra fields', async () => {
    await orderRepository.save(makeOrder({ paypalOrderId: 'PP-1', status: 'CREATED' }));

    const updated = await orderRepository.updateStatusByPaypalId('PP-1', 'COMPLETED', {
      paypalCaptureId: 'CAP-1',
    });

    expect(updated?.status).toBe('COMPLETED');
    expect(updated?.paypalCaptureId).toBe('CAP-1');
    const persisted = await orderRepository.findById('order-1');
    expect(persisted?.status).toBe('COMPLETED');
  });

  it('updateStatusByPaypalId returns null when no order matches', async () => {
    const updated = await orderRepository.updateStatusByPaypalId('unknown', 'COMPLETED');
    expect(updated).toBeNull();
  });
});
