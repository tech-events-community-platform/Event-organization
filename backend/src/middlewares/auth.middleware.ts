import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyAuthToken } from '../utils/jwt.util';
import { sendError } from '../utils/apiResponse';

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication token is required. Please log in.', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAuthToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      sendError(res, 'Session expired. Please log in again.', 401);
      return;
    }
    sendError(res, 'Invalid authentication token.', 401);
    return;
  }
};

export const optionalAuthenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyAuthToken(token);
      req.user = decoded;
    } catch {
      // Ignore invalid token for optional auth
    }
  }
  next();
};

