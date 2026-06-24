import { v4 as uuidv4 } from 'uuid';
import { firestore, collections } from '../config/firebase';
import {
  Shoe,
  ShoeCreateInput,
  ShoeGender,
  ShoeUpdateInput,
} from '../models/shoe.model';

const shoesCollection = () => firestore.collection(collections.shoes);

export const shoeService = {
  async create(input: ShoeCreateInput): Promise<Shoe> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const shoe: Shoe = {
      id,
      brand: input.brand,
      model: input.model,
      price: input.price,
      currency: input.currency ?? 'USD',
      description: input.description,
      imageUrl: input.imageUrl,
      ...(input.images ? { images: input.images } : {}),
      category: input.category,
      gender: input.gender,
      variants: input.variants ?? [],
      createdAt: now,
      updatedAt: now,
    };
    await shoesCollection().doc(id).set(shoe);
    return shoe;
  },

  async findAll(filter?: { gender?: ShoeGender }): Promise<Shoe[]> {
    const shoes = (await shoesCollection().orderBy('createdAt', 'desc').get())
      .docs.map((d) => d.data() as Shoe);
    if (filter?.gender) {
      return shoes.filter((s) => s.gender === filter.gender);
    }
    return shoes;
  },

  async findById(id: string): Promise<Shoe | null> {
    const doc = await shoesCollection().doc(id).get();
    return doc.exists ? (doc.data() as Shoe) : null;
  },

  async update(id: string, input: ShoeUpdateInput): Promise<Shoe | null> {
    const ref = shoesCollection().doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;
    const updates = { ...input, updatedAt: new Date().toISOString() };
    await ref.update(updates);
    const updated = await ref.get();
    return updated.data() as Shoe;
  },

  async remove(id: string): Promise<boolean> {
    const ref = shoesCollection().doc(id);
    const doc = await ref.get();
    if (!doc.exists) return false;
    await ref.delete();
    return true;
  },

  async decrementStock(
    shoeId: string,
    size: number,
    color: string,
    quantity: number,
  ): Promise<void> {
    const ref = shoesCollection().doc(shoeId);
    await firestore.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) {
        throw new Error(`Shoe ${shoeId} not found`);
      }
      const shoe = snap.data() as Shoe;
      const variants = [...shoe.variants];
      const idx = variants.findIndex(
        (v) => v.size === size && v.color === color,
      );
      if (idx === -1) {
        throw new Error(
          `Variant size=${size} color=${color} not found for shoe ${shoeId}`,
        );
      }
      if (variants[idx].stock < quantity) {
        throw new Error(
          `Insufficient stock for shoe ${shoeId} size=${size} color=${color}`,
        );
      }
      variants[idx] = {
        ...variants[idx],
        stock: variants[idx].stock - quantity,
        // Clear the matching reservation so available count stays consistent
        reserved: Math.max(0, (variants[idx].reserved ?? 0) - quantity),
      };
      tx.update(ref, {
        variants,
        updatedAt: new Date().toISOString(),
      });
    });
  },

  /**
   * Reserves `quantity` units for an in-flight payment. Checks against
   * available = stock − already-reserved to prevent overselling.
   */
  async reserveStock(
    shoeId: string,
    size: number,
    color: string,
    quantity: number,
  ): Promise<void> {
    const ref = shoesCollection().doc(shoeId);
    await firestore.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error(`Shoe ${shoeId} not found`);
      const shoe = snap.data() as Shoe;
      const variants = [...shoe.variants];
      const idx = variants.findIndex(
        (v) => v.size === size && v.color === color,
      );
      if (idx === -1) {
        throw new Error(
          `Variant size=${size} color=${color} not found for shoe ${shoeId}`,
        );
      }
      const available =
        variants[idx].stock - (variants[idx].reserved ?? 0);
      if (available < quantity) {
        throw new Error(
          `Insufficient available stock for shoe ${shoeId} size=${size} color=${color}`,
        );
      }
      variants[idx] = {
        ...variants[idx],
        reserved: (variants[idx].reserved ?? 0) + quantity,
      };
      tx.update(ref, { variants, updatedAt: new Date().toISOString() });
    });
  },

  /**
   * Releases a previously-made reservation (payment failed, order cleaned up).
   * Safe to call even when no reservation exists — will simply be a no-op.
   */
  async releaseReservation(
    shoeId: string,
    size: number,
    color: string,
    quantity: number,
  ): Promise<void> {
    const ref = shoesCollection().doc(shoeId);
    await firestore.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return;
      const shoe = snap.data() as Shoe;
      const variants = [...shoe.variants];
      const idx = variants.findIndex(
        (v) => v.size === size && v.color === color,
      );
      if (idx === -1) return;
      variants[idx] = {
        ...variants[idx],
        reserved: Math.max(0, (variants[idx].reserved ?? 0) - quantity),
      };
      tx.update(ref, { variants, updatedAt: new Date().toISOString() });
    });
  },
};
