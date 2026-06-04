import { firebaseAdmin, firestore } from '../config/firebase';

const ADMIN_EMAIL = 'admin@genaro.com';
const ADMIN_PASSWORD = '123456';

async function main() {
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
  console.log(`[seed-admin] Done. Login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed-admin] Failed:', err);
    process.exit(1);
  });
