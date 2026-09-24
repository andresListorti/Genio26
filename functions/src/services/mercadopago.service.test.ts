import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Order } from '../models/order.model';

const { paymentCreate } = vi.hoisted(() => ({ paymentCreate: vi.fn() }));
vi.mock('../config/mercadopago', () => ({
  getMercadoPago: () => ({ payment: { create: paymentCreate } }),
}));

import { mercadoPagoService } from './mercadopago.service';

beforeEach(() => {
  vi.clearAllMocks();
  paymentCreate.mockResolvedValue({
    id: 123,
    status: 'approved',
    external_reference: 'order-1',
    transaction_amount: 2000,
  });
});

const order = {
  id: 'order-1',
  subtotal: 2000,
  currency: 'ARS',
} as Order;

describe('mercadoPagoService.createPayment', () => {
  it('charges the server-side order total, ignoring the amount sent by the browser', async () => {
    await mercadoPagoService.createPayment(order, {
      token: 'tok',
      payment_method_id: 'visa',
      transaction_amount: 1,
    });

    expect(paymentCreate).toHaveBeenCalledTimes(1);
    expect(paymentCreate.mock.calls[0][0].body.transaction_amount).toBe(2000);
  });

  it('returns the amount Mercado Pago actually charged', async () => {
    const result = await mercadoPagoService.createPayment(order, {
      token: 'tok',
      payment_method_id: 'visa',
    });

    expect(result.transactionAmount).toBe(2000);
  });
});
