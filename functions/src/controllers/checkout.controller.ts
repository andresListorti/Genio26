import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { env, isMercadoPagoConfigured } from '../config/env';
import { AuthedRequest } from '../middlewares/auth.middleware';
import { Order } from '../models/order.model';

/**
 * What the public checkout endpoints may reveal about an order. The order id
 * travels in result-page URLs, so never return email / address / phone here.
 */
export function toPublicOrder(order: Order) {
  return {
    id: order.id,
    status: order.status,
    subtotal: order.subtotal,
    currency: order.currency,
  };
}

const PAYPAL_DISABLED = { error: 'PayPal no está disponible como medio de pago.' };
const CHECKOUT_CLOSED = {
  error: 'La tienda todavía no está habilitada para compras.',
};

const paypalAvailable = () => env.checkoutEnabled && env.paypal.enabled;

export const checkoutController = {
  /** Lets the storefront know whether it may offer checkout at all. */
  status(_req: Request, res: Response) {
    res.json({
      data: {
        enabled: env.checkoutEnabled && isMercadoPagoConfigured(),
        paypal: paypalAvailable(),
      },
    });
  },

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      if (!paypalAvailable()) return res.status(503).json(PAYPAL_DISABLED);
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
      if (!env.checkoutEnabled) return res.status(503).json(CHECKOUT_CLOSED);
      if (!isMercadoPagoConfigured()) {
        return res.status(503).json({
          error:
            'Mercado Pago no está configurado. Definí MERCADOPAGO_ACCESS_TOKEN.',
        });
      }
      // The buyer comes from the verified login (requireUser), never from the body.
      const user = (req as AuthedRequest).user!;
      const { cartId, payerEmail, payerName, shippingAddress, shippingPhone } =
        req.body ?? {};
      if (!cartId) {
        return res.status(400).json({ error: 'cartId is required' });
      }
      // Second-layer: shipping data must be present before creating any order.
      if (!shippingAddress?.trim() || !shippingPhone?.trim()) {
        return res.status(422).json({
          error: 'Dirección y teléfono de envío son requeridos para proceder con el pago.',
          code: 'SHIPPING_REQUIRED',
        });
      }
      const result = await orderService.createMercadoPagoFromCart(cartId, {
        userId: user.uid,
        payerEmail: payerEmail || user.email,
        payerName,
        shippingAddress,
        shippingPhone,
      });
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Confirms a Mercado Pago payment after the buyer is redirected back from
   * the MP checkout page. The frontend calls this with the `payment_id` (or
   * `collection_id`) that Mercado Pago appends to the success / pending URL.
   * Uses the same idempotent logic as the webhook so stock is only decremented
   * once even if both paths fire.
   */
  async confirmMercadoPagoPayment(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!env.checkoutEnabled) return res.status(503).json(CHECKOUT_CLOSED);
      if (!isMercadoPagoConfigured()) {
        return res.status(503).json({
          error: 'Mercado Pago no está configurado.',
        });
      }
      const { paymentId } = req.body ?? {};
      if (!paymentId) {
        return res.status(400).json({ error: 'paymentId is required' });
      }
      const order = await orderService.handleMercadoPagoWebhook(
        String(paymentId),
      );
      if (!order) {
        return res
          .status(404)
          .json({ error: 'No se encontró el pedido para este pago' });
      }
      res.json({ data: toPublicOrder(order) });
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
      if (!env.checkoutEnabled) return res.status(503).json(CHECKOUT_CLOSED);
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
        (req as AuthedRequest).user!.uid,
      );
      res
        .status(201)
        .json({ data: { order: toPublicOrder(order), status: order.status } });
    } catch (err) {
      next(err);
    }
  },

  async capture(req: Request, res: Response, next: NextFunction) {
    try {
      if (!paypalAvailable()) return res.status(503).json(PAYPAL_DISABLED);
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
      res.json({ data: toPublicOrder(order) });
    } catch (err) {
      next(err);
    }
  },
};
