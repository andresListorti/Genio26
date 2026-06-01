import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { env, isMercadoPagoConfigured } from './env';

/**
 * Mercado Pago client (Checkout Bricks).
 *
 * The official `mercadopago` SDK is only instantiated when an access token is
 * present, so the rest of the API boots fine while the production tokens are
 * still pending. Call `getMercadoPago()` from services to obtain the lazily
 * built clients, or `isMercadoPagoConfigured()` to guard endpoints.
 */
interface MercadoPagoClients {
  config: MercadoPagoConfig;
  preference: Preference;
  payment: Payment;
}

let cached: MercadoPagoClients | null = null;

export function getMercadoPago(): MercadoPagoClients {
  if (!isMercadoPagoConfigured()) {
    throw new Error(
      'Mercado Pago is not configured: set MERCADOPAGO_ACCESS_TOKEN in .env',
    );
  }
  if (!cached) {
    const config = new MercadoPagoConfig({
      accessToken: env.mercadopago.accessToken,
    });
    cached = {
      config,
      preference: new Preference(config),
      payment: new Payment(config),
    };
  }
  return cached;
}
