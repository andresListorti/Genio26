import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { env } from './env';

function loadCredential(): admin.credential.Credential | undefined {
  const filePath = path.resolve(process.cwd(), env.firebase.serviceAccountFile);
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf8');
    return admin.credential.cert(JSON.parse(raw) as admin.ServiceAccount);
  }
  if (env.firebase.projectId && env.firebase.clientEmail && env.firebase.privateKey) {
    return admin.credential.cert({
      projectId: env.firebase.projectId,
      clientEmail: env.firebase.clientEmail,
      privateKey: env.firebase.privateKey,
    });
  }
  // No local file, no explicit creds: rely on the ambient credentials Cloud
  // Functions/Cloud Run provide automatically for the same GCP project.
  return undefined;
}

if (!admin.apps.length) {
  const credential = loadCredential();
  admin.initializeApp(credential ? { credential } : undefined);
}

export const firebaseAdmin = admin;
export const firestore = admin.firestore();

firestore.settings({ ignoreUndefinedProperties: true });

export const collections = {
  shoes: 'shoes',
  carts: 'carts',
  orders: 'orders',
  users: 'users',
} as const;
