import { v4 as uuidv4 } from 'uuid';
import { firestore, collections } from '../config/firebase';
import { Cart, CartItem, AddCartItemInput } from '../models/cart.model';
import { shoeService } from './shoe.service';

const cartsCollection = () => firestore.collection(collections.carts);

function recalcSubtotal(items: CartItem[]): number {
  return Number(
    items
      .reduce((acc, item) => acc + item.unitPrice * item.quantity, 0)
      .toFixed(2),
  );
}

export const cartService = {
  async create(userId?: string): Promise<Cart> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const cart: Cart = {
      id,
      userId,
      items: [],
      subtotal: 0,
      currency: 'USD',
      createdAt: now,
      updatedAt: now,
    };
    await cartsCollection().doc(id).set(cart);
    return cart;
  },

  async findById(id: string): Promise<Cart | null> {
    const doc = await cartsCollection().doc(id).get();
    return doc.exists ? (doc.data() as Cart) : null;
  },

  async addItem(cartId: string, input: AddCartItemInput): Promise<Cart> {
    if (input.quantity <= 0) {
      throw new Error('quantity must be > 0');
    }
    const cart = await this.findById(cartId);
    if (!cart) throw new Error(`Cart ${cartId} not found`);

    const shoe = await shoeService.findById(input.shoeId);
    if (!shoe) throw new Error(`Shoe ${input.shoeId} not found`);

    const variant = shoe.variants.find(
      (v) => v.size === input.size && v.color === input.color,
    );
    if (!variant) {
      throw new Error(
        `Variant size=${input.size} color=${input.color} not available`,
      );
    }
    if (variant.stock < input.quantity) {
      throw new Error('Insufficient stock for requested variant');
    }

    const items = [...cart.items];
    const existingIdx = items.findIndex(
      (i) =>
        i.shoeId === input.shoeId &&
        i.size === input.size &&
        i.color === input.color,
    );
    if (existingIdx >= 0) {
      items[existingIdx] = {
        ...items[existingIdx],
        quantity: items[existingIdx].quantity + input.quantity,
      };
    } else {
      items.push({
        shoeId: shoe.id,
        brand: shoe.brand,
        model: shoe.model,
        size: input.size,
        color: input.color,
        unitPrice: shoe.price,
        quantity: input.quantity,
      });
    }

    const updated: Cart = {
      ...cart,
      items,
      subtotal: recalcSubtotal(items),
      currency: shoe.currency ?? cart.currency,
      updatedAt: new Date().toISOString(),
    };
    await cartsCollection().doc(cartId).set(updated);
    return updated;
  },

  async removeItem(
    cartId: string,
    shoeId: string,
    size: number,
    color: string,
  ): Promise<Cart> {
    const cart = await this.findById(cartId);
    if (!cart) throw new Error(`Cart ${cartId} not found`);

    const items = cart.items.filter(
      (i) => !(i.shoeId === shoeId && i.size === size && i.color === color),
    );
    const updated: Cart = {
      ...cart,
      items,
      subtotal: recalcSubtotal(items),
      updatedAt: new Date().toISOString(),
    };
    await cartsCollection().doc(cartId).set(updated);
    return updated;
  },

  async clear(cartId: string): Promise<Cart> {
    const cart = await this.findById(cartId);
    if (!cart) throw new Error(`Cart ${cartId} not found`);
    const updated: Cart = {
      ...cart,
      items: [],
      subtotal: 0,
      updatedAt: new Date().toISOString(),
    };
    await cartsCollection().doc(cartId).set(updated);
    return updated;
  },
};
