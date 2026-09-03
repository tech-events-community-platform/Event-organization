import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, full_name, role, phone, bio, organization } = req.body;
      const result = await AuthService.registerUser({
        email,
        password,
        full_name,
        role,
        phone,
        bio,
        organization,
      });

      return sendSuccess(res, result, 'User registered successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.loginUser({ email, password });

      return sendSuccess(res, result, 'Login successful.');
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await AuthService.getCurrentUser(userId);

      return sendSuccess(res, user, 'Current user profile retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response) {
    return sendSuccess(
      res,
      null,
      'Logged out successfully. Please clear the session token from client storage.'
    );
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    if (!email) {
      sendError(res, 'Email address is required.', 400);
      return;
    }
    const result = await AuthService.forgotPassword(email);
    sendSuccess(res, result, result.message);
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      sendError(res, 'Token and newPassword are required.', 400);
      return;
    }
    const result = await AuthService.resetPassword(token, newPassword);
    sendSuccess(res, result, result.message);
  }
}

