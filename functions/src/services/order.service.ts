import { orderRepository } from './order/order.repository';
import { cleanupPendingOrders } from './order/order.fulfillment';
import { paypalOrders } from './order/order.paypal';
import { mercadoPagoOrders } from './order/order.mercadopago';

export const orderService = {
  ...paypalOrders,
  ...mercadoPagoOrders,
  findById: orderRepository.findById,
  findByPaypalOrderId: orderRepository.findByPaypalOrderId,
  updateStatusByPaypalId: orderRepository.updateStatusByPaypalId,
  cleanupPendingOrders,
};
