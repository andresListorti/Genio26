import { v4 as uuidv4 } from 'uuid';
import { getMercadoPago } from '../config/mercadopago';
import { Cart } from '../models/cart.model';
import { Order } from '../models/order.model';

/** Shape of the data emitted by the Payment Brick `onSubmit` callback. */
export interface MercadoPagoBrickFormData {
  token?: string;
  issuer_id?: string;
  payment_method_id: string;
  transaction_amount?: number;
  installments?: number;
  payer?: {
    email?: string;
    identification?: { type?: string; number?: string };
  };
}

export interface MercadoPagoPaymentResult {
  id: string;
  status: string;
  statusDetail?: string;
  payerEmail?: string;
}

export const mercadoPagoService = {
  /**
   * Creates a Checkout preference for the given order. The returned id feeds
   * the Bricks `initialization.preferenceId` so payment happens in-app.
   */
  async createPreference(order: Order, cart: Cart): Promise<string> {
    const { preference } = getMercadoPago();
    const currencyId = (cart.currency || 'ARS').toUpperCase();
    const result = await preference.create({
      body: {
        items: cart.items.map((item) => ({
          id: `${item.shoeId}-${item.size}-${item.color}`,
          title: `${item.brand} ${item.model}`,
          description: `Talle ${item.size} / ${item.color}`,
          category_id: 'fashion',
          quantity: item.quantity,
          unit_price: Number(item.unitPrice),
          currency_id: currencyId,
        })),
        external_reference: order.id,
        statement_descriptor: 'GENARO',
      },
    });
    if (!result.id) {
      throw new Error('Mercado Pago did not return a preference id');
    }
    return result.id;
  },

  /**
   * Processes a payment from the Payment Brick form data (seamless, no
   * redirect). Returns the normalized Mercado Pago payment outcome.
   */
  async createPayment(
    order: Order,
    formData: MercadoPagoBrickFormData,
  ): Promise<MercadoPagoPaymentResult> {
    const { payment } = getMercadoPago();
    const amount =
      typeof formData.transaction_amount === 'number'
        ? formData.transaction_amount
        : Number(order.subtotal);

    const result = await payment.create({
      body: {
        transaction_amount: amount,
        token: formData.token,
        description: `Genaro · pedido ${order.id}`,
        installments: formData.installments ?? 1,
        payment_method_id: formData.payment_method_id,
        issuer_id: formData.issuer_id
          ? Number(formData.issuer_id)
          : undefined,
        external_reference: order.id,
        payer: {
          email: formData.payer?.email,
          identification: formData.payer?.identification,
        },
      },
      requestOptions: { idempotencyKey: `${order.id}-${uuidv4()}` },
    });

    return {
      id: String(result.id ?? ''),
      status: result.status ?? 'pending',
      statusDetail: result.status_detail,
      payerEmail: result.payer?.email,
    };
  },
};
