import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const { createFromCart, captureOrder, updateStatusByPaypalId } = vi.hoisted(() => ({
  createFromCart: vi.fn(),
  captureOrder: vi.fn(),
  updateStatusByPaypalId: vi.fn(),
}));
vi.mock('../services/order.service', () => ({
  orderService: { createFromCart, captureOrder, updateStatusByPaypalId },
}));
const { verifyWebhookSignature } = vi.hoisted(() => ({
  verifyWebhookSignature: vi.fn().mockResolvedValue(true),
}));
vi.mock('../services/paypal.service', () => ({
  paypalService: { verifyWebhookSignature },
}));
vi.mock('../config/env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../config/env')>();
  return { ...actual, env: { ...actual.env, paypal: { ...actual.env.paypal, enabled: false } } };
});

import { checkoutController } from './checkout.controller';
import { webhookController } from './webhook.controller';

function mockRes() {
  const res = {} as Response & { statusCode: number; body: unknown };
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  }) as never;
  res.json = vi.fn((body: unknown) => {
    res.body = body;
    return res;
  }) as never;
  return res;
}

describe('PayPal disabled (PAYPAL_ENABLED unset)', () => {
  it('rejects creating a PayPal order', async () => {
    const res = mockRes();
    await checkoutController.createOrder({ body: { cartId: 'cart-1' } } as Request, res, vi.fn());
    expect(res.statusCode).toBe(503);
    expect(createFromCart).not.toHaveBeenCalled();
  });

  it('rejects capturing a PayPal order', async () => {
    const res = mockRes();
    await checkoutController.capture({ params: { orderId: 'o-1' } } as unknown as Request, res, vi.fn());
    expect(res.statusCode).toBe(503);
    expect(captureOrder).not.toHaveBeenCalled();
  });

  it('acknowledges PayPal webhooks without applying them', async () => {
    const res = mockRes();
    await webhookController.handlePaypal(
      {
        headers: {},
        body: { event_type: 'PAYMENT.CAPTURE.COMPLETED', resource: { id: 'x' } },
      } as Request,
      res,
      vi.fn(),
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ received: true, applied: false });
    expect(updateStatusByPaypalId).not.toHaveBeenCalled();
  });
});
