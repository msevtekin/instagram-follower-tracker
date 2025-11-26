/**
 * Authentication Middleware
 * 
 * Verifies Firebase ID tokens and extracts user information.
 */

import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

// Extend Express Request to include user information
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

/**
 * Middleware to verify Firebase ID tokens.
 * Extracts user ID from token and attaches to request.
 * Returns 401 if token is missing or invalid.
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
}

export default authMiddleware;
