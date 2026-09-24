import { firebaseAdmin, firestore } from '../config/firebase';

// Credentials come from the local environment (functions/.env or the shell),
// never from source: this repo is public.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';

async function main() {
  if (!ADMIN_EMAIL || ADMIN_PASSWORD.length < 12) {
    throw new Error(
      'Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ chars) in functions/.env before running seed:admin.',
    );
  }
  console.log('[seed-admin] Starting...');

  let uid: string;

  try {
    const existing = await firebaseAdmin.auth().getUserByEmail(ADMIN_EMAIL);
    uid = existing.uid;
    console.log(`[seed-admin] User already exists (${uid}). Updating password...`);
    await firebaseAdmin.auth().updateUser(uid, { password: ADMIN_PASSWORD });
    console.log('[seed-admin] Password updated.');
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'auth/user-not-found') {
      const user = await firebaseAdmin.auth().createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        emailVerified: true,
        displayName: 'Admin',
      });
      uid = user.uid;
      console.log(`[seed-admin] Created new user: ${uid}`);
    } else {
      throw err;
    }
  }

  await firestore.collection('users').doc(uid).set(
    {
      uid,
      email: ADMIN_EMAIL,
      displayName: 'Admin',
      photoURL: null,
      role: 'admin',
    },
    { merge: true },
  );

  console.log('[seed-admin] Firestore profile set with role: admin.');
  console.log(`[seed-admin] Done. Admin login: ${ADMIN_EMAIL}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed-admin] Failed:', err);
    process.exit(1);
  });
