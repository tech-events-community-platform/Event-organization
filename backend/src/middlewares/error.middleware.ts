import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Unhandled Error:', err);

  // PostgreSQL unique constraint error
  if (err.code === '23505') {
    if (err.constraint === 'unique_event_user_registration') {
      sendError(res, 'You are already registered for this event.', 409);
      return;
    }
    if (err.detail && err.detail.includes('email')) {
      sendError(res, 'An account with this email already exists.', 409);
      return;
    }
    sendError(res, 'Duplicate record already exists.', 409);
    return;
  }

  // PostgreSQL foreign key error
  if (err.code === '23503') {
    sendError(res, 'Referenced resource not found.', 404);
    return;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token provided.', 401);
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  sendError(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : undefined);
};

export const notFoundHandler = (
  req: Request,
  res: Response
): void => {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

