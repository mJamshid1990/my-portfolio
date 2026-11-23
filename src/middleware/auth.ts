import type { NextFunction, Request, Response } from 'express';
import { adminAuth, type VerifiedFirebaseToken } from '../lib/firebase-admin.ts';
import { getOrCreateUser } from '../db/users.ts';

export interface AuthUserRecord {
  id: number;
  uid: string;
  email: string;
  displayName: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: VerifiedFirebaseToken;
  dbUser?: AuthUserRecord;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Empty token' });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;

    const email = decodedToken.email || '';
    const displayName =
      typeof decodedToken.name === 'string' ? decodedToken.name : '';
    const syncedUser = await getOrCreateUser(
      decodedToken.uid,
      email,
      displayName
    );
    req.dbUser = syncedUser;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.dbUser || req.dbUser.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden: Admin privileges are required for this action.',
    });
  }
  next();
};
