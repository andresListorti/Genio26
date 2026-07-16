import crypto from 'crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { webhookSecret } = vi.hoisted(() => ({ webhookSecret: { value: '' } }));

vi.mock('../config/env', async () => {
  const actual = await vi.importActual<typeof import('../config/env')>('../config/env');
  return {
    ...actual,
    env: {
      ...actual.env,
      get mercadopago() {
        return { ...actual.env.mercadopago, webhookSecret: webhookSecret.value };
      },
    },
  };
});

import { verifyMercadoPagoSignature } from './webhook.controller';

beforeEach(() => {
  webhookSecret.value = '';
});

function sign(secret: string, paymentId: string, requestId: string, ts: string): string {
  const message = `id:${paymentId};request-id:${requestId};ts:${ts}`;
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

describe('verifyMercadoPagoSignature', () => {
  it('skips verification (returns true) when no secret is configured — dev mode', () => {
    webhookSecret.value = '';
    expect(verifyMercadoPagoSignature('', 'req-1', 'pay-1')).toBe(true);
  });

  it('accepts a correctly signed header', () => {
    webhookSecret.value = 'shh';
    const ts = '1700000000';
    const v1 = sign('shh', 'pay-1', 'req-1', ts);
    const header = `ts=${ts};v1=${v1}`;
    expect(verifyMercadoPagoSignature(header, 'req-1', 'pay-1')).toBe(true);
  });

  it('rejects a tampered signature', () => {
    webhookSecret.value = 'shh';
    const header = 'ts=1700000000;v1=deadbeef';
    expect(verifyMercadoPagoSignature(header, 'req-1', 'pay-1')).toBe(false);
  });

  // Regression test: this is the exact bug that let a webhook bypass signature
  // verification simply by omitting the x-signature header. The controller
  // used to only call this function when the header was present
  // ("signatureHeader && !verify(...)"), so an empty header short-circuited
  // straight past the check instead of being rejected.
  it('rejects a missing header when a secret is configured', () => {
    webhookSecret.value = 'shh';
    expect(verifyMercadoPagoSignature('', 'req-1', 'pay-1')).toBe(false);
  });

  it('rejects a header missing the ts or v1 segment', () => {
    webhookSecret.value = 'shh';
    expect(verifyMercadoPagoSignature('v1=abc', 'req-1', 'pay-1')).toBe(false);
    expect(verifyMercadoPagoSignature('ts=123', 'req-1', 'pay-1')).toBe(false);
  });
});
