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
};
