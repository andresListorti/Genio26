import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Response } from 'express';

const { nodeEnv } = vi.hoisted(() => ({ nodeEnv: { value: 'development' } }));

vi.mock('../config/env', async () => {
  const actual = await vi.importActual<typeof import('../config/env')>('../config/env');
  return {
    ...actual,
    env: {
      ...actual.env,
      get nodeEnv() {
        return nodeEnv.value;
      },
    },
  };
});

import { errorHandler, notFoundHandler } from './error.middleware';

function makeRes(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  nodeEnv.value = 'development';
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('notFoundHandler', () => {
  it('responds 404', () => {
    const res = makeRes();
    notFoundHandler({} as any, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Route not found' });
  });
});

describe('errorHandler', () => {
  it('exposes the real error message in development', () => {
    nodeEnv.value = 'development';
    const res = makeRes();
    errorHandler(new Error('Cart cart-1 not found'), {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cart cart-1 not found' });
  });

  it('hides the real error message in production', () => {
    nodeEnv.value = 'production';
    const res = makeRes();
    errorHandler(
      new Error('5 NOT_FOUND: internal Firestore detail'),
      {} as any,
      res,
      vi.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  });

  it('falls back to a generic message when the error has no message', () => {
    nodeEnv.value = 'development';
    const res = makeRes();
    errorHandler(new Error(''), {} as any, res, vi.fn());

    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  });
});
