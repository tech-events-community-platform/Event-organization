import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
import { sendError } from '../utils/apiResponse';

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Unauthorized. Please log in first.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
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

