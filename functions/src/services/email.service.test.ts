import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Order } from '../models/order.model';

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock('resend', () => ({
  Resend: class {
    emails = { send };
  },
}));
vi.mock('../config/env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../config/env')>();
  return {
    ...actual,
    env: {
      ...actual.env,
      resend: {
        apiKey: 're_test',
        fromEmail: 'onboarding@resend.dev',
        adminEmail: 'store@example.com',
      },
    },
  };
});

import { emailService } from './email.service';

const order: Order = {
  id: 'abcdef12-3456',
  cartId: 'cart-1',
  items: [
    {
      shoeId: 'shoe-1',
      brand: 'Genaro',
      model: 'Colmar',
      size: 38,
      color: 'negro',
      unitPrice: 1000,
      quantity: 2,
    },
  ],
  subtotal: 2000,
  currency: 'ARS',
  status: 'COMPLETED',
  provider: 'mercadopago',
  payerEmail: 'buyer@example.com',
  shippingAddress: '<img src=x onerror=alert(1)> Calle 123',
  shippingPhone: '11 5555-5555',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
  send.mockResolvedValue({ data: { id: 'email-1' }, error: null });
});

describe('emailService.sendOrderConfirmation', () => {
  it('sends the purchase confirmation to the buyer with replies going to the store', async () => {
    await emailService.sendOrderConfirmation(order);

    const msg = send.mock.calls[0][0];
    expect(msg.to).toBe('buyer@example.com');
    expect(msg.replyTo).toBe('store@example.com');
    expect(msg.html).toContain('¡Gracias por tu compra!');
    expect(msg.html).toContain('Colmar');
  });

  it('escapes customer-typed text so it cannot inject HTML', async () => {
    await emailService.sendOrderConfirmation(order);

    const { html } = send.mock.calls[0][0];
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt; Calle 123');
  });

  it('logs when Resend rejects the email instead of failing silently', async () => {
    send.mockResolvedValue({ data: null, error: { message: 'invalid from' } });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await emailService.sendOrderConfirmation(order);

    expect(spy).toHaveBeenCalledWith(
      '[email] sendOrderConfirmation rejected:',
      { message: 'invalid from' },
    );
    spy.mockRestore();
  });
});

describe('emailService.sendAdminNotification', () => {
  it('notifies the store inbox with escaped customer data', async () => {
    await emailService.sendAdminNotification(order);

    const msg = send.mock.calls[0][0];
    expect(msg.to).toBe('store@example.com');
    expect(msg.html).not.toContain('<img src=x');
  });
});
