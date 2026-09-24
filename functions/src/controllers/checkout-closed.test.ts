import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const {
  createMercadoPagoFromCart,
  processMercadoPagoPayment,
  handleMercadoPagoWebhook,
  findById,
} = vi.hoisted(() => ({
  createMercadoPagoFromCart: vi.fn(),
  processMercadoPagoPayment: vi.fn(),
  handleMercadoPagoWebhook: vi.fn(),
  findById: vi.fn(),
}));
vi.mock('../services/order.service', () => ({
  orderService: {
    createMercadoPagoFromCart,
    processMercadoPagoPayment,
    handleMercadoPagoWebhook,
    findById,
  },
}));
// Mercado Pago fully configured, but the store is closed.
vi.mock('../config/env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../config/env')>();
  return {
    ...actual,
    isMercadoPagoConfigured: () => true,
    env: { ...actual.env, checkoutEnabled: false, paypal: { ...actual.env.paypal, enabled: true } },
  };
});

import { checkoutController } from './checkout.controller';

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

const req = (body: object = {}, params: object = {}) =>
  ({ body, params }) as unknown as Request;

describe('checkout closed (CHECKOUT_ENABLED unset)', () => {
  it('reports checkout and PayPal as unavailable', () => {
    const res = mockRes();
    checkoutController.status(req(), res);
    expect(res.body).toEqual({ data: { enabled: false, paypal: false } });
  });

  it('rejects creating a Mercado Pago preference', async () => {
    const res = mockRes();
    await checkoutController.createMercadoPagoPreference(req({ cartId: 'c-1' }), res, vi.fn());
    expect(res.statusCode).toBe(503);
    expect(createMercadoPagoFromCart).not.toHaveBeenCalled();
  });

  it('rejects processing a Mercado Pago payment', async () => {
    const res = mockRes();
    await checkoutController.processMercadoPagoPayment(
      req({ orderId: 'o-1', formData: {} }),
      res,
      vi.fn(),
    );
    expect(res.statusCode).toBe(503);
    expect(processMercadoPagoPayment).not.toHaveBeenCalled();
  });

  it('rejects confirming a Mercado Pago payment', async () => {
    const res = mockRes();
    await checkoutController.confirmMercadoPagoPayment(req({ paymentId: '1' }), res, vi.fn());
    expect(res.statusCode).toBe(503);
    expect(handleMercadoPagoWebhook).not.toHaveBeenCalled();
  });

  it('rejects PayPal even when PayPal itself is enabled', async () => {
    const res = mockRes();
    await checkoutController.createOrder(req({ cartId: 'c-1' }), res, vi.fn());
    expect(res.statusCode).toBe(503);
  });
});
