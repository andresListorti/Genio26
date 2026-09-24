import { randomUUID } from 'crypto';
import { getMercadoPago } from '../config/mercadopago';
import { env } from '../config/env';
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
  externalReference?: string;
  /** Amount Mercado Pago actually charged — checked against the order total. */
  transactionAmount?: number;
}

export const mercadoPagoService = {
  /**
   * Creates a Checkout preference for the given order. The returned id feeds
   * the Bricks `initialization.preferenceId` so payment happens in-app.
   *
   * `payerInfo` is optional: when the buyer is authenticated we pre-fill name
   * and email so Mercado Pago can skip that step in their UI.
   */
  async createPreference(
    order: Order,
    cart: Cart,
    payerInfo?: { email?: string; name?: string },
  ): Promise<string> {
    const { preference } = getMercadoPago();
    const currencyId = (cart.currency || 'ARS').toUpperCase();
    // `auto_return` requires a public success URL — Mercado Pago rejects
    // localhost ("auto_return invalid. back_url.success must be defined"). The
    // back_urls themselves work locally (the browser does the redirect), so we
    // keep them always and only opt into auto_return on a public frontend URL.
    const isLocalFrontend = /localhost|127\.0\.0\.1/.test(env.frontendUrl);
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
        // Where Mercado Pago sends the buyer back after the redirect flow
        // (wallet / account money). `auto_return` skips the MP "volver" screen
        // and bounces approved payments straight to our success page. MP appends
        // payment_id / status / external_reference / merchant_order_id as query
        // params, which the success page reads to confirm the order.
        back_urls: {
          success: `${env.frontendUrl}/checkout/success`,
          failure: `${env.frontendUrl}/checkout/failure`,
          pending: `${env.frontendUrl}/checkout/pending`,
        },
        // Allow up to 12 cuotas/installments (standard in Argentina)
        payment_methods: { installments: 12 },
        ...(isLocalFrontend ? {} : { auto_return: 'approved' }),
        ...(payerInfo?.email
          ? { payer: { name: payerInfo.name, email: payerInfo.email } }
          : {}),
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
    // Always charge the server-side order total. formData.transaction_amount
    // comes from the browser and must never decide how much gets charged.
    const result = await payment.create({
      body: {
        transaction_amount: Number(order.subtotal),
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
      requestOptions: { idempotencyKey: `${order.id}-${randomUUID()}` },
    });

    return {
      id: String(result.id ?? ''),
      status: result.status ?? 'pending',
      statusDetail: result.status_detail,
      payerEmail: result.payer?.email,
      externalReference: result.external_reference ?? undefined,
      transactionAmount: result.transaction_amount ?? undefined,
    };
  },

  /**
   * Fetches a payment by id from Mercado Pago. Used by the webhook to resolve
   * the authoritative payment status (and its external_reference → order id).
   */
  async getPayment(paymentId: string): Promise<MercadoPagoPaymentResult> {
    const { payment } = getMercadoPago();
    const result = await payment.get({ id: paymentId });
    return {
      id: String(result.id ?? paymentId),
      status: result.status ?? 'pending',
      statusDetail: result.status_detail,
      payerEmail: result.payer?.email,
      externalReference: result.external_reference ?? undefined,
      transactionAmount: result.transaction_amount ?? undefined,
    };
  },
};
