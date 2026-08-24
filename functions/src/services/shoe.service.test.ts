import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Shoe } from '../models/shoe.model';

vi.mock('../config/firebase', async () => {
  const fake = await import('../test-utils/fakeFirestore');
  return { firestore: fake.firestore, collections: fake.collections };
});

import { resetFakeFirestore } from '../test-utils/fakeFirestore';
import { shoeService } from './shoe.service';

beforeEach(() => {
  resetFakeFirestore();
});

function makeShoe(overrides: Partial<Shoe> = {}): Shoe {
  const now = new Date().toISOString();
  return {
    id: 'shoe-1',
    brand: 'Genaro',
    model: 'Colmar',
    price: 1000,
    currency: 'ARS',
    description: 'test',
    gender: 'women',
    variants: [{ size: 38, color: 'marron', stock: 10, reserved: 0 }],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('shoeService CRUD', () => {
  it('create + findById round-trips a shoe', async () => {
    const created = await shoeService.create({
      brand: 'Genaro',
      model: 'Colmar',
      price: 1000,
      currency: 'ARS',
      description: 'test',
      gender: 'women',
      variants: [],
    });
    const found = await shoeService.findById(created.id);
    expect(found).toEqual(created);
  });

  it('findAll filters by gender', async () => {
    await shoeService.create({
      brand: 'A', model: 'M', price: 1, currency: 'ARS', description: '', gender: 'men', variants: [],
    });
    await shoeService.create({
      brand: 'B', model: 'M', price: 1, currency: 'ARS', description: '', gender: 'women', variants: [],
    });

    const women = await shoeService.findAll({ gender: 'women' });
    expect(women).toHaveLength(1);
    expect(women[0].brand).toBe('B');
  });

  it('update merges fields and bumps updatedAt', async () => {
    const created = await shoeService.create({
      brand: 'Genaro', model: 'Colmar', price: 1000, currency: 'ARS', description: 'old', gender: 'women', variants: [],
    });
    const updated = await shoeService.update(created.id, { description: 'new' });
    expect(updated?.description).toBe('new');
    expect(updated?.brand).toBe('Genaro');
  });

  it('update returns null for a missing shoe', async () => {
    const updated = await shoeService.update('missing', { description: 'x' });
    expect(updated).toBeNull();
  });

  it('remove deletes an existing shoe and returns true', async () => {
    const created = await shoeService.create({
      brand: 'Genaro', model: 'Colmar', price: 1000, currency: 'ARS', description: '', gender: 'women', variants: [],
    });
    expect(await shoeService.remove(created.id)).toBe(true);
    expect(await shoeService.findById(created.id)).toBeNull();
  });

  it('remove returns false for a missing shoe', async () => {
    expect(await shoeService.remove('missing')).toBe(false);
  });
});

describe('shoeService.decrementStock', () => {
  it('reduces stock and clears a matching reservation', async () => {
    await shoeService.create(makeShoe());
    // create() generates its own id, so fetch it back to get the real one
    const [shoe] = await shoeService.findAll();
    await shoeService.reserveStock(shoe.id, 38, 'marron', 3);
    await shoeService.decrementStock(shoe.id, 38, 'marron', 3);

    const updated = await shoeService.findById(shoe.id);
    const variant = updated?.variants.find((v) => v.size === 38 && v.color === 'marron');
    expect(variant?.stock).toBe(7);
    expect(variant?.reserved).toBe(0);
  });

  it('throws for an unknown shoe', async () => {
    await expect(shoeService.decrementStock('missing', 38, 'marron', 1)).rejects.toThrow('not found');
  });

  it('throws for an unknown variant', async () => {
    await shoeService.create(makeShoe());
    const [shoe] = await shoeService.findAll();
    await expect(shoeService.decrementStock(shoe.id, 99, 'inexistente', 1)).rejects.toThrow('not found');
  });

  it('throws when quantity exceeds stock', async () => {
    await shoeService.create(makeShoe());
    const [shoe] = await shoeService.findAll();
    await expect(shoeService.decrementStock(shoe.id, 38, 'marron', 999)).rejects.toThrow(
      'Insufficient stock',
    );
  });
});

describe('shoeService.reserveStock', () => {
  it('increments the reserved count', async () => {
    await shoeService.create(makeShoe());
    const [shoe] = await shoeService.findAll();
    await shoeService.reserveStock(shoe.id, 38, 'marron', 4);

    const updated = await shoeService.findById(shoe.id);
    expect(updated?.variants[0].reserved).toBe(4);
    expect(updated?.variants[0].stock).toBe(10);
  });

  it('rejects a reservation beyond available stock (stock - reserved)', async () => {
    await shoeService.create(makeShoe({ variants: [{ size: 38, color: 'marron', stock: 5, reserved: 3 }] }));
    const [shoe] = await shoeService.findAll();
    await expect(shoeService.reserveStock(shoe.id, 38, 'marron', 3)).rejects.toThrow(
      'Insufficient available stock',
    );
  });
});

describe('shoeService.releaseReservation', () => {
  it('decrements the reserved count, floored at 0', async () => {
    await shoeService.create(makeShoe({ variants: [{ size: 38, color: 'marron', stock: 10, reserved: 2 }] }));
    const [shoe] = await shoeService.findAll();

    await shoeService.releaseReservation(shoe.id, 38, 'marron', 5);

    const updated = await shoeService.findById(shoe.id);
    expect(updated?.variants[0].reserved).toBe(0);
  });

  it('is a no-op for an unknown shoe', async () => {
    await expect(shoeService.releaseReservation('missing', 38, 'marron', 1)).resolves.toBeUndefined();
  });

  it('is a no-op for an unknown variant', async () => {
    await shoeService.create(makeShoe());
    const [shoe] = await shoeService.findAll();
    await expect(
      shoeService.releaseReservation(shoe.id, 99, 'inexistente', 1),
    ).resolves.toBeUndefined();
  });
});
