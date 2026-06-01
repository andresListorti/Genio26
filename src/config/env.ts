import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  firebase: {
    projectId: required('FIREBASE_PROJECT_ID'),
    clientEmail: required('FIREBASE_CLIENT_EMAIL'),
    privateKey: required('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    serviceAccountFile:
      process.env.FIREBASE_SERVICE_ACCOUNT_FILE ??
      'sun-66f-firebase-adminsdk-fbsvc-ef0b5a5ff9.json',
  },

  paypal: {
    clientId: required('PAYPAL_CLIENT_ID'),
    clientSecret: required('PAYPAL_CLIENT_SECRET'),
    apiUrl: process.env.PAYPAL_API_URL ?? 'https://api-m.sandbox.paypal.com',
    webhookId: process.env.PAYPAL_WEBHOOK_ID ?? '',
    mode: (process.env.PAYPAL_MODE ?? 'sandbox') as 'sandbox' | 'live',
    // PayPal does not support ARS. When the cart currency is unsupported we
    // charge in USD using this rate (ARS per 1 USD). Override via env.
    fallbackCurrency: process.env.PAYPAL_FALLBACK_CURRENCY ?? 'USD',
    arsPerUsd: parseFloat(process.env.PAYPAL_ARS_PER_USD ?? '1000'),
  },

  // Optional until production tokens are provided. The token gates whether the
  // Mercado Pago endpoints are active.
  mercadopago: {
    publicKey: process.env.MERCADOPAGO_PUBLIC_KEY ?? '',
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? '',
  },
};

/** True once a Mercado Pago access token is configured in the environment. */
export const isMercadoPagoConfigured = (): boolean =>
  Boolean(env.mercadopago.accessToken);
