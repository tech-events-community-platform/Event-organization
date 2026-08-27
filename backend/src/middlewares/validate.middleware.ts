import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password, full_name, role } = req.body;

  if (!email || !password || !full_name) {
    sendError(res, 'Email, password, and full name are required.', 400);
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    sendError(res, 'Please provide a valid email address.', 400);
    return;
  }

  if (password.length < 6) {
    sendError(res, 'Password must be at least 6 characters long.', 400);
    return;
  }

  if (role && !['attendee', 'organizer', 'admin'].includes(role)) {
    sendError(res, 'Role must be either attendee or organizer.', 400);
    return;
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    sendError(res, 'Email and password are required.', 400);
    return;
  }

  next();
};

export const validateEvent = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, description, event_date, location, capacity } = req.body;

  if (!title || !description || !event_date || !location || capacity === undefined) {
    sendError(
      res,
      'Title, description, event_date, location, and capacity are required.',
      400
    );
    return;
  }

  const parsedDate = new Date(event_date);
  if (isNaN(parsedDate.getTime())) {
    sendError(res, 'Invalid event_date format. Use ISO 8601 date string.', 400);
    return;
  }

  const parsedCapacity = parseInt(capacity, 10);
  if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
    sendError(res, 'Capacity must be a positive integer.', 400);
    return;
  }

  next();
};

export const validateCheckIn = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { qr_token, event_id } = req.body;

  if (!qr_token) {
    sendError(res, 'qr_token is required for check-in verification.', 400);
    return;
  }

  next();
};

