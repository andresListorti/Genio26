import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { isMercadoPagoConfigured } from '../config/env';

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

  /** Creates a Mercado Pago order + Checkout preference for the cart. */
  async createMercadoPagoPreference(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!isMercadoPagoConfigured()) {
        return res.status(503).json({
          error:
            'Mercado Pago no está configurado. Definí MERCADOPAGO_ACCESS_TOKEN.',
        });
      }
      const { cartId, userId } = req.body ?? {};
      if (!cartId) {
        return res.status(400).json({ error: 'cartId is required' });
      }
      const result = await orderService.createMercadoPagoFromCart(
        cartId,
        userId,
      );
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  /** Processes the Payment Brick submission for a Mercado Pago order. */
  async processMercadoPagoPayment(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!isMercadoPagoConfigured()) {
        return res.status(503).json({
          error:
            'Mercado Pago no está configurado. Definí MERCADOPAGO_ACCESS_TOKEN.',
        });
      }
      const { orderId, formData } = req.body ?? {};
      if (!orderId || !formData || !formData.payment_method_id) {
        return res
          .status(400)
          .json({ error: 'orderId and formData (payment_method_id) required' });
      }
      const order = await orderService.processMercadoPagoPayment(
        orderId,
        formData,
      );
      res.status(201).json({ data: { order, status: order.status } });
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
