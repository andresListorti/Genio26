import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { paypalService } from '../services/paypal.service';
import { orderService } from '../services/order.service';
import { env } from '../config/env';
import { OrderStatus } from '../models/order.model';

// ─── MP signature verification ────────────────────────────────────────────────
// Header format: x-signature: ts=<epoch_ms>;v1=<hmac_sha256_hex>
// Signed string: id:<paymentId>;request-id:<x-request-id>;ts:<ts>
// Secret: MERCADOPAGO_WEBHOOK_SECRET from the MP developer panel.

function verifyMercadoPagoSignature(
  signatureHeader: string,
  requestId: string,
  paymentId: string,
): boolean {
  const secret = env.mercadopago.webhookSecret;
  if (!secret) return true; // dev: skip when no secret is configured

  const parts: Record<string, string> = {};
  for (const segment of signatureHeader.split(';')) {
    const eq = segment.indexOf('=');
    if (eq !== -1) parts[segment.slice(0, eq)] = segment.slice(eq + 1);
  }
  const ts = parts['ts'];
  const v1 = parts['v1'];
  if (!ts || !v1) return false;

  const message = `id:${paymentId};request-id:${requestId};ts:${ts}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(v1, 'hex'),
      Buffer.from(expected, 'hex'),
    );
  } catch {
    return false;
  }
}

// ─── PayPal helpers ───────────────────────────────────────────────────────────

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

// ─── Controller ───────────────────────────────────────────────────────────────

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
   * Mercado Pago payment notifications. Verifies the x-signature HMAC before
   * processing to reject spoofed webhook calls. Always responds 200 quickly.
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
        return res.status(200).json({ received: true, applied: false });
      }

      // Verify HMAC signature when a secret is configured
      const signatureHeader = String(req.headers['x-signature'] ?? '');
      const requestId = String(req.headers['x-request-id'] ?? '');
      if (
        signatureHeader &&
        !verifyMercadoPagoSignature(signatureHeader, requestId, paymentId)
      ) {
        return res.status(400).json({ error: 'Invalid MP webhook signature' });
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
