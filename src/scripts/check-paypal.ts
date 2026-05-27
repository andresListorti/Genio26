import { env } from '../config/env';

function maskTail(value: string, keep = 4): string {
  if (!value) return '(empty)';
  if (value.length <= keep) return '*'.repeat(value.length);
  return value.slice(0, keep) + '…' + value.slice(-keep);
}

async function main() {
  const { clientId, clientSecret, apiUrl } = env.paypal;

  console.log('[paypal-check] Using endpoint:', apiUrl);
  console.log('[paypal-check] Client ID:    ', maskTail(clientId));
  console.log('[paypal-check] Client Secret:', maskTail(clientSecret));
  console.log('[paypal-check] CLIENT_ID length:    ', clientId.length);
  console.log('[paypal-check] CLIENT_SECRET length:', clientSecret.length);

  if (clientId.length !== 80 || clientSecret.length !== 80) {
    console.log(
      '[paypal-check] ⚠  Sandbox credentials are typically 80 chars each. Yours are not — likely truncated, padded or mistyped.',
    );
  }

  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(`${apiUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: 'grant_type=client_credentials',
  });

  const text = await res.text();
  console.log('[paypal-check] HTTP', res.status, res.statusText);

  if (res.ok) {
    const data = JSON.parse(text) as {
      access_token: string;
      expires_in: number;
      app_id: string;
      scope: string;
    };
    console.log('[paypal-check] ✅ Token acquired.');
    console.log('  app_id    :', data.app_id);
    console.log('  expires_in:', data.expires_in, 's');
    console.log('  scopes    :', data.scope.split(' ').length, 'scopes');
    return;
  }

  console.log('[paypal-check] ❌ Authentication failed.');
  try {
    const body = JSON.parse(text) as { error?: string; error_description?: string };
    console.log('  error            :', body.error);
    console.log('  error_description:', body.error_description);
  } catch {
    console.log('  body:', text);
  }

  console.log('\nNext steps:');
  console.log(
    '  1. Open https://developer.paypal.com/dashboard/applications/sandbox',
  );
  console.log('  2. Open your sandbox REST API app (or create one)');
  console.log('  3. Copy the Client ID and Secret (use the eye icon to reveal)');
  console.log(
    '  4. Paste them verbatim into F:\\Code\\.env as PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET',
  );
  console.log('  5. Re-run: npm run check:paypal');
  process.exit(1);
}

main().catch((err) => {
  console.error('[paypal-check] Unexpected error:', err);
  process.exit(1);
});
