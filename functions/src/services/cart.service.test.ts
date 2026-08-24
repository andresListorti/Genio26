import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Shoe } from '../models/shoe.model';

vi.mock('../config/firebase', async () => {
  const fake = await import('../test-utils/fakeFirestore');
  return { firestore: fake.firestore, collections: fake.collections };
});

const { findShoeById } = vi.hoisted(() => ({ findShoeById: vi.fn() }));
vi.mock('./shoe.service', () => ({
  shoeService: { findById: findShoeById },
}));

import { resetFakeFirestore } from '../test-utils/fakeFirestore';
import { cartService } from './cart.service';

beforeEach(() => {
  resetFakeFirestore();
  vi.clearAllMocks();
});

const shoe: Shoe = {
  id: 'shoe-1',
  brand: 'Genaro',
  model: 'Colmar',
  price: 1000,
  currency: 'ARS',
  description: 'test',
  gender: 'women',
  variants: [{ size: 38, color: 'marron', stock: 5, reserved: 0 }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('cartService.create', () => {
  it('creates an empty cart', async () => {
    const cart = await cartService.create('user-1');
    expect(cart.userId).toBe('user-1');
    expect(cart.items).toEqual([]);
    expect(cart.subtotal).toBe(0);
  });
});

describe('cartService.addItem', () => {
  it('adds a new line and recalculates the subtotal', async () => {
    findShoeById.mockResolvedValue(shoe);
    const cart = await cartService.create();

    const updated = await cartService.addItem(cart.id, {
      shoeId: 'shoe-1',
      size: 38,
      color: 'marron',
      quantity: 2,
    });

    expect(updated.items).toHaveLength(1);
    expect(updated.subtotal).toBe(2000);
    expect(updated.currency).toBe('ARS');
  });

  it('merges quantity into an existing line for the same variant', async () => {
    findShoeById.mockResolvedValue(shoe);
    const cart = await cartService.create();
    await cartService.addItem(cart.id, { shoeId: 'shoe-1', size: 38, color: 'marron', quantity: 1 });
    const updated = await cartService.addItem(cart.id, {
      shoeId: 'shoe-1',
      size: 38,
      color: 'marron',
      quantity: 2,
    });

    expect(updated.items).toHaveLength(1);
    expect(updated.items[0].quantity).toBe(3);
    expect(updated.subtotal).toBe(3000);
  });

  it('rejects a non-positive quantity', async () => {
    const cart = await cartService.create();
    await expect(
      cartService.addItem(cart.id, { shoeId: 'shoe-1', size: 38, color: 'marron', quantity: 0 }),
    ).rejects.toThrow('quantity must be > 0');
  });

  it('throws for a missing cart', async () => {
    await expect(
      cartService.addItem('missing', { shoeId: 'shoe-1', size: 38, color: 'marron', quantity: 1 }),
    ).rejects.toThrow('not found');
  });

  it('throws for a missing shoe', async () => {
    findShoeById.mockResolvedValue(null);
    const cart = await cartService.create();
    await expect(
      cartService.addItem(cart.id, { shoeId: 'missing', size: 38, color: 'marron', quantity: 1 }),
    ).rejects.toThrow('not found');
  });

  it('throws for an unavailable variant', async () => {
    findShoeById.mockResolvedValue(shoe);
    const cart = await cartService.create();
    await expect(
      cartService.addItem(cart.id, { shoeId: 'shoe-1', size: 99, color: 'inexistente', quantity: 1 }),
    ).rejects.toThrow('not available');
  });

  it('throws when the requested quantity exceeds stock', async () => {
    findShoeById.mockResolvedValue(shoe);
    const cart = await cartService.create();
    await expect(
      cartService.addItem(cart.id, { shoeId: 'shoe-1', size: 38, color: 'marron', quantity: 999 }),
    ).rejects.toThrow('Insufficient stock');
  });
});

describe('cartService.removeItem', () => {
  it('removes the matching line and recalculates the subtotal', async () => {
    findShoeById.mockResolvedValue(shoe);
    const cart = await cartService.create();
    await cartService.addItem(cart.id, { shoeId: 'shoe-1', size: 38, color: 'marron', quantity: 2 });

    const updated = await cartService.removeItem(cart.id, 'shoe-1', 38, 'marron');
    expect(updated.items).toHaveLength(0);
    expect(updated.subtotal).toBe(0);
  });

  it('throws for a missing cart', async () => {
    await expect(cartService.removeItem('missing', 'shoe-1', 38, 'marron')).rejects.toThrow('not found');
  });
});

describe('cartService.clear', () => {
  it('empties the cart', async () => {
    findShoeById.mockResolvedValue(shoe);
    const cart = await cartService.create();
    await cartService.addItem(cart.id, { shoeId: 'shoe-1', size: 38, color: 'marron', quantity: 1 });

    const cleared = await cartService.clear(cart.id);
    expect(cleared.items).toEqual([]);
    expect(cleared.subtotal).toBe(0);
  });

  it('throws for a missing cart', async () => {
    await expect(cartService.clear('missing')).rejects.toThrow('not found');
  });
});
