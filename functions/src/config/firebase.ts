import { cert, getApps, initializeApp, Credential, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { env } from './env';

function loadCredential(): Credential | undefined {
  const filePath = path.resolve(process.cwd(), env.firebase.serviceAccountFile);
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf8');
    return cert(JSON.parse(raw) as ServiceAccount);
  }
  if (env.firebase.projectId && env.firebase.clientEmail && env.firebase.privateKey) {
    return cert({
      projectId: env.firebase.projectId,
      clientEmail: env.firebase.clientEmail,
      privateKey: env.firebase.privateKey,
    });
  }
  // No local file, no explicit creds: rely on the ambient credentials Cloud
  // Functions/Cloud Run provide automatically for the same GCP project.
  return undefined;
}

const app =
  getApps()[0] ??
  (() => {
    const credential = loadCredential();
    return initializeApp(credential ? { credential } : undefined);
  })();

// firebase-admin v14 is modular-only; keep the `firebaseAdmin.auth()` shape
// the rest of the backend already uses.
export const firebaseAdmin = { auth: () => getAuth(app) };
export const firestore = getFirestore(app);

firestore.settings({ ignoreUndefinedProperties: true });

export const collections = {
  shoes: 'shoes',
  carts: 'carts',
  orders: 'orders',
  users: 'users',
} as const;
