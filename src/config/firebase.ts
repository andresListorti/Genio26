import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { env } from './env';

function loadServiceAccount(): admin.ServiceAccount {
  const filePath = path.resolve(process.cwd(), env.firebase.serviceAccountFile);
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as admin.ServiceAccount;
  }
  return {
    projectId: env.firebase.projectId,
    clientEmail: env.firebase.clientEmail,
    privateKey: env.firebase.privateKey,
  };
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(loadServiceAccount()),
    projectId: env.firebase.projectId,
  });
}

export const firebaseAdmin = admin;
export const firestore = admin.firestore();

firestore.settings({ ignoreUndefinedProperties: true });

export const collections = {
  shoes: 'shoes',
  carts: 'carts',
  orders: 'orders',
} as const;
