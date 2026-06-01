import { Request, Response, NextFunction } from 'express';
import { paypalService } from '../services/paypal.service';
import { orderService } from '../services/order.service';
import { OrderStatus } from '../models/order.model';

function mapEventToStatus(eventType: string): OrderStatus | null {
  switch (eventType) {
    case 'CHECKOUT.ORDER.APPROVED':
      return 'APPROVED';
    case 'PAYMENT.CAPTURE.COMPLETED':
    case 'CHECKOUT.ORDER.COMPLETED':
      return 'COMPLETED';
    case 'CHECKOUT.ORDER.VOIDED':
    case 'PAYMENT.CAPTURE.DENIED':
      return 'CANCELLED';
    case 'PAYMENT.CAPTURE.REFUNDED':
    case 'PAYMENT.CAPTURE.REVERSED':
      return 'REFUNDED';
    default:
      return null;
  }
}

function extractPaypalOrderId(event: any): string | undefined {
  const resource = event?.resource;
  if (!resource) return undefined;
  if (resource.id && event.event_type?.startsWith('CHECKOUT.ORDER.')) {
    return resource.id as string;
  }
  if (resource.supplementary_data?.related_ids?.order_id) {
    return resource.supplementary_data.related_ids.order_id as string;
  }
  return undefined;
}

export const webhookController = {
  async handlePaypal(req: Request, res: Response, next: NextFunction) {
    try {
      const verified = await paypalService.verifyWebhookSignature(
        req.headers,
        req.body,
      );
      if (!verified) {
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }

      const event = req.body as { event_type?: string; resource?: any };
      const eventType = event.event_type ?? '';
      const status = mapEventToStatus(eventType);
      const paypalOrderId = extractPaypalOrderId(event);

      if (status && paypalOrderId) {
        const captureId =
          event.resource?.id && eventType.startsWith('PAYMENT.CAPTURE.')
            ? (event.resource.id as string)
            : undefined;
        await orderService.updateStatusByPaypalId(paypalOrderId, status, {
          ...(captureId ? { paypalCaptureId: captureId } : {}),
        });
      }

      res.status(200).json({ received: true, eventType, applied: !!status });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Mercado Pago payment notifications. MP sends `type=payment` (body or query)
   * with the payment id; we fetch the payment, map its status and update the
   * order. Always answers 200 quickly so MP doesn't retry on our processing.
   */
  async handleMercadoPago(req: Request, res: Response, next: NextFunction) {
    try {
      const body = (req.body ?? {}) as {
        type?: string;
        action?: string;
        data?: { id?: string | number };
      };
      const query = req.query as { type?: string; 'data.id'?: string; id?: string };

      const type = body.type ?? query.type ?? '';
      const action = body.action ?? '';
      const isPayment =
        type === 'payment' || action.startsWith('payment.');
      const paymentId = String(
        body.data?.id ?? query['data.id'] ?? query.id ?? '',
      );

      if (!isPayment || !paymentId) {
        // Merchant-order / test pings: acknowledge without processing.
        return res.status(200).json({ received: true, applied: false });
      }

      const order = await orderService.handleMercadoPagoWebhook(paymentId);
      res
        .status(200)
        .json({ received: true, applied: !!order, status: order?.status });
    } catch (err) {
      next(err);
    }
  },
};
