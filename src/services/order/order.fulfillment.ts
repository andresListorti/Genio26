import { Order } from '../../models/order.model';
import { cartService } from '../cart.service';
import { shoeService } from '../shoe.service';
import { emailService } from '../email.service';
import { orderRepository } from './order.repository';

/** Decrements stock for every line and clears the originating cart. */
export async function fulfillOrder(order: Order): Promise<void> {
  for (const item of order.items) {
    await shoeService.decrementStock(
      item.shoeId,
      item.size,
      item.color,
      item.quantity,
    );
  }
  if (order.cartId) {
    await cartService.clear(order.cartId).catch(() => undefined);
  }
}

/** Releases stock reservations for all items in an order. */
export async function releaseOrderReservations(order: Order): Promise<void> {
  await Promise.all(
    order.items.map((item) =>
      shoeService
        .releaseReservation(item.shoeId, item.size, item.color, item.quantity)
        .catch(() => undefined),
    ),
  );
}

/** Sends the buyer confirmation + admin notification emails; fire-and-forget. */
export function notifyOrderCompleted(order: Order): void {
  emailService.sendOrderConfirmation(order).catch(() => undefined);
  emailService.sendAdminNotification(order).catch(() => undefined);
}

/**
 * Deletes any CREATED orders tied to a cart that the user has abandoned or
 * modified. Only removes CREATED status — APPROVED (in-bank processing),
 * COMPLETED, and terminal states are never touched.
 *
 * Also releases stock reservations held by those orders.
 */
export async function cleanupPendingOrders(cartId: string): Promise<void> {
  const orders = await orderRepository.findByCartId(cartId);
  const stale = orders.filter((o) => o.status === 'CREATED');
  if (stale.length === 0) return;
  await Promise.all(
    stale.map(async (order) => {
      await releaseOrderReservations(order);
      return orderRepository.deleteById(order.id);
    }),
  );
}
