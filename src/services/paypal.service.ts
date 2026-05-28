import { paypalClient, paypalSdk } from '../config/paypal';
import { env } from '../config/env';
import { Cart } from '../models/cart.model';

export interface PaypalOrderResult {
  id: string;
  status: string;
  links: Array<{ href: string; rel: string; method: string }>;
}

export const paypalService = {
  async createOrder(cart: Cart): Promise<PaypalOrderResult> {
    const request = new paypalSdk.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    const body: any = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: cart.id,
          description: `Zapateria Genaro order — cart ${cart.id}`,
          amount: {
            currency_code: cart.currency || 'USD',
            value: cart.subtotal.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: cart.currency || 'USD',
                value: cart.subtotal.toFixed(2),
              },
            },
          },
          items: cart.items.map((item) => ({
            name: `${item.brand} ${item.model}`,
            description: `Size ${item.size} / ${item.color}`,
            sku: `${item.shoeId}-${item.size}-${item.color}`,
            unit_amount: {
              currency_code: cart.currency || 'USD',
              value: item.unitPrice.toFixed(2),
            },
            quantity: String(item.quantity),
          })),
        },
      ],
    };
    request.requestBody(body);

    const response = await paypalClient.execute(request);
    return {
      id: response.result.id,
      status: response.result.status,
      links: response.result.links ?? [],
    };
  },

  async captureOrder(paypalOrderId: string): Promise<{
    id: string;
    status: string;
    captureId?: string;
    payerEmail?: string;
  }> {
    const request = new paypalSdk.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({} as any);
    const response = await paypalClient.execute(request);
    const result = response.result;
    const captureId =
      result.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? undefined;
    return {
      id: result.id,
      status: result.status,
      captureId,
      payerEmail: result.payer?.email_address,
    };
  },

  async verifyWebhookSignature(
    headers: Record<string, string | string[] | undefined>,
    body: unknown,
  ): Promise<boolean> {
    if (!env.paypal.webhookId) {
      return env.nodeEnv !== 'production';
    }
    const get = (key: string): string => {
      const value = headers[key.toLowerCase()];
      if (Array.isArray(value)) return value[0] ?? '';
      return value ?? '';
    };

    const payload = {
      auth_algo: get('paypal-auth-algo'),
      cert_url: get('paypal-cert-url'),
      transmission_id: get('paypal-transmission-id'),
      transmission_sig: get('paypal-transmission-sig'),
      transmission_time: get('paypal-transmission-time'),
      webhook_id: env.paypal.webhookId,
      webhook_event: body,
    };

    const accessToken = await getAccessToken();
    const res = await fetch(
      `${env.paypal.apiUrl}/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { verification_status?: string };
    return data.verification_status === 'SUCCESS';
  },
};

async function getAccessToken(): Promise<string> {
  const creds = Buffer.from(
    `${env.paypal.clientId}:${env.paypal.clientSecret}`,
  ).toString('base64');
  const res = await fetch(`${env.paypal.apiUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    throw new Error(`Failed to obtain PayPal access token (${res.status})`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}
