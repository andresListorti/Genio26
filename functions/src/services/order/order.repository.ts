import { firestore, collections } from '../../config/firebase';
import { Order, OrderStatus } from '../../models/order.model';

export const ordersCollection = () => firestore.collection(collections.orders);

export const orderRepository = {
  async findById(id: string): Promise<Order | null> {
    const doc = await ordersCollection().doc(id).get();
    return doc.exists ? (doc.data() as Order) : null;
  },

  async findByPaypalOrderId(paypalOrderId: string): Promise<Order | null> {
    const snap = await ordersCollection()
      .where('paypalOrderId', '==', paypalOrderId)
      .limit(1)
      .get();
    if (snap.empty) return null;
    return snap.docs[0].data() as Order;
  },

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    const snap = await ordersCollection().where('status', '==', status).get();
    return snap.docs.map((d) => d.data() as Order);
  },

  async findByCartId(cartId: string): Promise<Order[]> {
    const snap = await ordersCollection().where('cartId', '==', cartId).get();
    return snap.docs.map((d) => d.data() as Order);
  },

  async save(order: Order): Promise<Order> {
    await ordersCollection().doc(order.id).set(order);
    return order;
  },

  async deleteById(id: string): Promise<void> {
    await ordersCollection().doc(id).delete();
  },

  async updateStatusByPaypalId(
    paypalOrderId: string,
    status: OrderStatus,
    extra: Partial<Order> = {},
  ): Promise<Order | null> {
    const order = await this.findByPaypalOrderId(paypalOrderId);
    if (!order) return null;
    const updated: Order = {
      ...order,
      ...extra,
      status,
      updatedAt: new Date().toISOString(),
    };
    return this.save(updated);
  },
};
