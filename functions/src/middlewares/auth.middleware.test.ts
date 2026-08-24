import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Response } from 'express';

const { verifyIdToken } = vi.hoisted(() => ({ verifyIdToken: vi.fn() }));

vi.mock('../config/firebase', async () => {
  const fake = await import('../test-utils/fakeFirestore');
  return {
    firestore: fake.firestore,
    collections: fake.collections,
    firebaseAdmin: { auth: () => ({ verifyIdToken }) },
  };
});

import { resetFakeFirestore, firestore, collections } from '../test-utils/fakeFirestore';
import { requireAdmin, AuthedRequest } from './auth.middleware';

beforeEach(() => {
  resetFakeFirestore();
  vi.clearAllMocks();
});

function makeReq(authorization?: string): AuthedRequest {
  return { headers: authorization ? { authorization } : {} } as AuthedRequest;
}

function makeRes(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('requireAdmin', () => {
  it('rejects with 401 when there is no Authorization header', async () => {
    const req = makeReq();
    const res = makeRes();
    const next = vi.fn();

    await requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects with 401 for a malformed (non-Bearer) header', async () => {
    const req = makeReq('Token abc');
    const res = makeRes();
    const next = vi.fn();

    await requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects with 401 when the token is invalid or expired', async () => {
    verifyIdToken.mockRejectedValue(new Error('invalid token'));
    const req = makeReq('Bearer bad-token');
    const res = makeRes();
    const next = vi.fn();

    await requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects with 403 for a valid token belonging to a non-admin user', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'user-1' });
    await firestore.collection(collections.users).doc('user-1').set({ role: 'user' });

    const req = makeReq('Bearer good-token');
    const res = makeRes();
    const next = vi.fn();

    await requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects with 403 when the user has no profile document at all', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'ghost-user' });

    const req = makeReq('Bearer good-token');
    const res = makeRes();
    const next = vi.fn();

    await requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('calls next() for a valid admin token', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'admin-1' });
    await firestore.collection(collections.users).doc('admin-1').set({ role: 'admin' });

    const req = makeReq('Bearer good-token');
    const res = makeRes();
    const next = vi.fn();

    await requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({ uid: 'admin-1', role: 'admin' });
    expect(res.status).not.toHaveBeenCalled();
  });
});
