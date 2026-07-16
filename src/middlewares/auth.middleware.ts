import { Request, Response, NextFunction } from 'express';
import { firebaseAdmin, firestore, collections } from '../config/firebase';

export interface AuthedRequest extends Request {
  user?: { uid: string; role: string };
}

/**
 * Verifies a Firebase ID token (Authorization: Bearer <token>) and checks the
 * caller's Firestore profile has role "admin". Rejects with 401 for a
 * missing/invalid token, 403 for a valid non-admin user.
 */
export async function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) {
      return res.status(401).json({ error: 'Missing Authorization bearer token' });
    }

    const decoded = await firebaseAdmin.auth().verifyIdToken(token);
    const profile = await firestore
      .collection(collections.users)
      .doc(decoded.uid)
      .get();
    const role = profile.exists ? (profile.data()?.role as string) : 'user';

    if (role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = { uid: decoded.uid, role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
