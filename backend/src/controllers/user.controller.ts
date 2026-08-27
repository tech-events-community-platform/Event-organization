import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export class UserController {
  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await UserService.getUserProfile(userId);

      return sendSuccess(res, user, 'Profile retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { full_name, phone, bio, organization } = req.body;
      const updatedUser = await UserService.updateUserProfile(userId, {
        full_name,
        phone,
        bio,
        organization,
      });

      return sendSuccess(res, updatedUser, 'Profile updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async getAttendanceHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const history = await UserService.getUserAttendanceHistory(userId);

      return sendSuccess(
        res,
        history,
        'Attendance and verified participation history retrieved.'
      );
    } catch (error) {
      next(error);
    }
  }
}

