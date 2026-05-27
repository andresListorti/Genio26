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
  },
};
