import { Response, NextFunction } from 'express';
import { CheckinService } from '../services/checkin.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export class CheckinController {
  static async verifyCheckIn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { qr_token, event_id } = req.body;
      const scannedByUserId = req.user!.userId;
      const userRole = req.user!.role;

      const result = await CheckinService.verifyAndCheckIn(
        qr_token,
        scannedByUserId,
        userRole,
        event_id
      );

      return sendSuccess(res, result, 'Check-in verified successfully. Attendance recorded.');
    } catch (error: any) {
      if (error.alreadyCheckedIn) {
        return res.status(409).json({
          success: false,
          message: error.message,
          error: 'ALREADY_CHECKED_IN',
          data: {
            checked_in_at: error.checked_in_at,
            attendee: error.attendee,
          },
        });
      }
      next(error);
    }
  }
}

