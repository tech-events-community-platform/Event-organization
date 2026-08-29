import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
import { sendError } from '../utils/apiResponse';

export const authorizeRoles = (...allowedRoles: (UserRole | string)[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Unauthorized. Please log in first.', 401);
      return;
    }

    const userRole = (req.user.role || '').toLowerCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

    if (!normalizedAllowed.includes(userRole)) {
      sendError(
        res,
        `Forbidden. Access restricted to: ${allowedRoles.join(', ')}`,
        403
      );
      return;
    }

    next();
  };
};
