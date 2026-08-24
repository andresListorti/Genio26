import checkoutNodeJssdk from '@paypal/checkout-server-sdk';
import { env } from './env';

function buildEnvironment() {
  if (env.paypal.mode === 'live') {
    return new checkoutNodeJssdk.core.LiveEnvironment(
      env.paypal.clientId,
      env.paypal.clientSecret,
    );
  }
  return new checkoutNodeJssdk.core.SandboxEnvironment(
    env.paypal.clientId,
    env.paypal.clientSecret,
  );
}

export const paypalClient = new checkoutNodeJssdk.core.PayPalHttpClient(
  buildEnvironment(),
);

export { checkoutNodeJssdk as paypalSdk };
