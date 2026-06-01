import { env, isMercadoPagoConfigured } from '../config/env';
import { getMercadoPago } from '../config/mercadopago';
import { mercadoPagoService } from '../services/mercadopago.service';
import { Cart } from '../models/cart.model';
import { Order } from '../models/order.model';

function maskTail(value: string, keep = 6): string {
  if (!value) return '(empty)';
  if (value.length <= keep) return '*'.repeat(value.length);
  return value.slice(0, keep) + '…' + value.slice(-4);
}

/**
 * Mercado Pago token prefixes tell us the environment without an API round
 * trip: `TEST-` are test/sandbox credentials, `APP_USR-` are production/live.
 */
function classifyToken(token: string): 'SANDBOX' | 'LIVE' | 'UNKNOWN' {
  if (token.startsWith('TEST-')) return 'SANDBOX';
  if (token.startsWith('APP_USR-')) return 'LIVE';
  return 'UNKNOWN';
}

interface MpUser {
  id?: number;
  nickname?: string;
  email?: string;
  site_id?: string;
  registration_date?: string;
}

async function main() {
  console.log('=== Mercado Pago integration diagnostic ===\n');

  // ---- 1. Credential presence -------------------------------------------
  const { publicKey, accessToken } = env.mercadopago;
  console.log('[mp-check] Public Key:   ', maskTail(publicKey));
  console.log('[mp-check] Access Token: ', maskTail(accessToken));

  if (!isMercadoPagoConfigured()) {
    console.log(
      '\n[mp-check] ❌ MERCADOPAGO_ACCESS_TOKEN is missing. Set it in F:\\Code\\.env and re-run.',
    );
    process.exit(1);
  }

  const tokenEnv = classifyToken(accessToken);
  const keyEnv = classifyToken(publicKey);
  console.log('[mp-check] Token prefix  →', tokenEnv);
  console.log('[mp-check] Pub key prefix →', keyEnv);
  if (tokenEnv !== keyEnv && keyEnv !== 'UNKNOWN') {
    console.log(
      `[mp-check] ⚠  Mismatch: access token looks ${tokenEnv} but public key looks ${keyEnv}. ` +
        'Both must come from the SAME application/environment or the Brick will fail.',
    );
  }

  // ---- 2. SDK initialization --------------------------------------------
  let clients;
  try {
    clients = getMercadoPago();
    console.log('\n[mp-check] ✅ SDK initialized (MercadoPagoConfig + Preference + Payment).');
  } catch (err) {
    console.log('\n[mp-check] ❌ SDK failed to initialize:', (err as Error).message);
    process.exit(1);
  }

  // ---- 3. Authenticate against the live MP API --------------------------
  // /users/me is the cheapest authenticated GET and works for both test and
  // production tokens — a 401/403 here means the token is invalid/revoked.
  console.log('\n[mp-check] Authenticating against https://api.mercadopago.com/users/me …');
  const res = await fetch('https://api.mercadopago.com/users/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });
  const text = await res.text();
  console.log('[mp-check] HTTP', res.status, res.statusText);

  if (!res.ok) {
    console.log('[mp-check] ❌ Authentication failed.');
    if (res.status === 401 || res.status === 403) {
      console.log(
        `  → ${res.status} ${res.statusText}: the access token was rejected ` +
          '(invalid, revoked, or wrong environment).',
      );
    }
    try {
      const body = JSON.parse(text) as { message?: string; error?: string };
      console.log('  message:', body.message ?? body.error);
    } catch {
      console.log('  body:', text.slice(0, 300));
    }
    console.log('\nNext steps:');
    console.log('  1. Open https://www.mercadopago.com.ar/developers/panel/app');
    console.log('  2. Open your application → Credenciales');
    console.log('  3. Copy the Access Token + Public Key (Test or Production) verbatim');
    console.log('  4. Paste into F:\\Code\\.env, then re-run: npm run check:mercadopago');
    process.exit(1);
  }

  const user = JSON.parse(text) as MpUser;
  console.log('[mp-check] ✅ Authenticated.');
  console.log('  account id :', user.id);
  console.log('  nickname   :', user.nickname);
  console.log('  site_id    :', user.site_id);

  // ---- 4. Preference API test (mirrors POST /api/checkout/mercadopago) ---
  // Mock the $1 Palermo shoe cart so we exercise the *real* preference-building
  // code (mercadoPagoService.createPreference) the endpoint runs, without
  // needing Firestore or a seeded cart.
  console.log('\n[mp-check] Creating a test preference (mock $1 Palermo cart) …');
  const now = new Date().toISOString();
  const mockCart: Cart = {
    id: 'diagnostic-cart',
    items: [
      {
        shoeId: 'palermo',
        brand: 'Genaro',
        model: 'Palermo',
        size: 42,
        color: 'Negro',
        unitPrice: 1,
        quantity: 1,
      },
    ],
    subtotal: 1,
    currency: 'ARS',
    createdAt: now,
    updatedAt: now,
  };
  const mockOrder: Order = {
    id: 'diagnostic-order',
    cartId: mockCart.id,
    items: mockCart.items,
    subtotal: mockCart.subtotal,
    currency: mockCart.currency,
    status: 'CREATED',
    provider: 'mercadopago',
    createdAt: now,
    updatedAt: now,
  };

  let preferenceId: string;
  try {
    preferenceId = await mercadoPagoService.createPreference(mockOrder, mockCart);
    console.log('[mp-check] ✅ Preference created.');
    console.log('  preferenceId:', preferenceId);
  } catch (err) {
    console.log('[mp-check] ❌ Preference creation failed:', (err as Error).message);
    process.exit(1);
  }

  // Read it back to surface the init URL the front end redirects to.
  try {
    const pref = await clients.preference.get({ preferenceId });
    const initUrl = tokenEnv === 'LIVE' ? pref.init_point : pref.sandbox_init_point;
    console.log('  init_point        :', pref.init_point);
    console.log('  sandbox_init_point:', pref.sandbox_init_point);
    console.log('  → use this URL    :', initUrl);
  } catch (err) {
    console.log('[mp-check] ⚠  Could not read the preference back:', (err as Error).message);
  }

  // ---- 5. Verdict --------------------------------------------------------
  console.log('\n=== RESULT ===');
  console.log(`Status        : ${tokenEnv === 'LIVE' ? '🟢 LIVE (production)' : '🟡 SANDBOX (test)'}`);
  console.log('Authentication: ✅ OK (no 401/403)');
  console.log('Preference API: ✅ OK — returned a valid preferenceId + init URL');
  if (tokenEnv === 'SANDBOX') {
    console.log(
      '\nNote: these are TEST credentials. Real money is NOT charged. Use Mercado Pago ' +
        'test cards / test buyer accounts. Swap in APP_USR- credentials to go live.',
    );
  }
}

main().catch((err) => {
  console.error('[mp-check] Unexpected error:', err);
  process.exit(1);
});
