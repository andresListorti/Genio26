import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const { createMercadoPagoFromCart, findById } = vi.hoisted(() => ({
  createMercadoPagoFromCart: vi.fn().mockResolvedValue({ order: {}, preferenceId: 'p', publicKey: 'k' }),
  findById: vi.fn(),
}));
vi.mock('../services/order.service', () => ({
  orderService: { createMercadoPagoFromCart, findById },
}));
const { verifyIdToken } = vi.hoisted(() => ({ verifyIdToken: vi.fn() }));
vi.mock('../config/firebase', () => ({
  firebaseAdmin: { auth: () => ({ verifyIdToken }) },
  firestore: {},
  collections: { users: 'users' },
}));
vi.mock('../config/env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../config/env')>();
  return { ...actual, isMercadoPagoConfigured: () => true, env: { ...actual.env, checkoutEnabled: true } };
});

import { checkoutController, toPublicOrder } from './checkout.controller';
import { requireUser } from '../middlewares/auth.middleware';

function mockRes() {
  const res = {} as Response & { statusCode: number; body: any };
  res.status = vi.fn((c: number) => ((res.statusCode = c), res)) as never;
  res.json = vi.fn((b: unknown) => ((res.body = b), res)) as never;
  return res;
}

const fullOrder = {
  id: 'o-1', status: 'COMPLETED', subtotal: 2000, currency: 'ARS',
  payerEmail: 'buyer@example.com', shippingAddress: 'Calle 1', shippingPhone: '11', userId: 'alice',
};

describe('requireUser', () => {
  it('rejects a request without a login token', async () => {
    const res = mockRes(); const next = vi.fn();
    await requireUser({ headers: {} } as Request, res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects an invalid token', async () => {
    verifyIdToken.mockRejectedValueOnce(new Error('bad'));
    const res = mockRes(); const next = vi.fn();
    await requireUser({ headers: { authorization: 'Bearer nope' } } as Request, res, next);
    expect(res.statusCode).toBe(401);
  });

  it('attaches the verified user', async () => {
    verifyIdToken.mockResolvedValueOnce({ uid: 'alice', email: 'a@example.com' });
    const req = { headers: { authorization: 'Bearer ok' } } as any; const next = vi.fn();
    await requireUser(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ uid: 'alice', email: 'a@example.com' });
  });
});

describe('checkout controller — who pays and what is revealed', () => {
  it('takes the buyer from the verified login, ignoring a userId in the body', async () => {
    const res = mockRes();
    await checkoutController.createMercadoPagoPreference(
      { user: { uid: 'alice', role: 'user', email: 'a@example.com' },
        body: { cartId: 'c-1', userId: 'mallory', shippingAddress: 'Calle 1', shippingPhone: '11' } } as any,
      res, vi.fn(),
    );
    expect(createMercadoPagoFromCart).toHaveBeenCalledWith('c-1', expect.objectContaining({ userId: 'alice', payerEmail: 'a@example.com' }));
  });

  it('public order lookup never returns email, address or phone', async () => {
    findById.mockResolvedValueOnce(fullOrder);
    const res = mockRes();
    await checkoutController.getOrder({ params: { orderId: 'o-1' } } as any, res, vi.fn());
    expect(res.body.data).toEqual({ id: 'o-1', status: 'COMPLETED', subtotal: 2000, currency: 'ARS' });
    expect(toPublicOrder(fullOrder as any)).not.toHaveProperty('payerEmail');
  });
});
