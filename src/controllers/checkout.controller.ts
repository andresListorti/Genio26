import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';

export const checkoutController = {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { cartId, userId } = req.body ?? {};
      if (!cartId) {
        return res.status(400).json({ error: 'cartId is required' });
      }
      const { order, approveUrl } = await orderService.createFromCart(
        cartId,
        userId,
      );
      res.status(201).json({ data: { order, approveUrl } });
    } catch (err) {
      next(err);
    }
  },

  async capture(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = String(req.params.orderId);
      const order = await orderService.captureOrder(orderId);
      res.json({ data: order });
    } catch (err) {
      next(err);
    }
  },

  async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.findById(String(req.params.orderId));
      if (!order) return res.status(404).json({ error: 'Order not found' });
      res.json({ data: order });
    } catch (err) {
      next(err);
    }
  },
};
