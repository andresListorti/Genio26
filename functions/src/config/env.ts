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

const frontendUrl = (process.env.FRONTEND_URL ?? 'http://localhost:3001').replace(
  /\/$/,
  '',
);

export const env = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  // Master payment switch. Closed unless CHECKOUT_ENABLED=true: every payment
  // endpoint answers 503 and the storefront shows "tienda en preparación".
  checkoutEnabled: process.env.CHECKOUT_ENABLED === 'true',

  // Public URL of the Genaro storefront (Next.js). Used to build Mercado Pago
  // back_urls so the buyer returns to the right page after the redirect flow.
  frontendUrl,

  // Browser origins allowed to call this API (CORS). Defaults to just the
  // configured frontend. Add Vercel preview domains etc. via a comma-separated
  // CORS_ORIGINS env var. Does not affect server-to-server calls (webhooks,
  // curl) — CORS is a browser-enforced restriction only.
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : [frontendUrl],

  // Production (Vercel) uses the FIREBASE_* env vars. Local dev uses the
  // service-account JSON, kept in the gitignored repo-root .secrets/ folder —
  // never inside functions/, which is the folder uploaded on deploy.
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID ?? '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
    serviceAccountFile:
      process.env.FIREBASE_SERVICE_ACCOUNT_FILE ?? '../.secrets/firebase-admin.json',
  },

  paypal: {
    // Off unless explicitly enabled. While PayPal runs against the sandbox,
    // leaving it on would let anyone "pay" with a free test account.
    enabled: process.env.PAYPAL_ENABLED === 'true',
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
    // Set in the MP developer panel → Webhooks → secret key. Used to verify
    // incoming webhook signatures. When empty, verification is skipped (dev only).
    webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET ?? '',
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY ?? '',
    // Verified sender address (e.g. "Genaro <noreply@genaro.com.ar>").
    // Until a domain is verified in Resend, use "onboarding@resend.dev".
    fromEmail: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
    // Admin inbox that receives new-order notifications.
    adminEmail: process.env.RESEND_ADMIN_EMAIL ?? '',
  },

  // Optional — error tracking is disabled when unset (e.g. local dev without a DSN).
  sentry: {
    dsn: process.env.SENTRY_DSN ?? '',
  },
};

/** True once a Mercado Pago access token is configured in the environment. */
export const isMercadoPagoConfigured = (): boolean =>
  Boolean(env.mercadopago.accessToken);
