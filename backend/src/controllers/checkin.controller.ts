import { Response, NextFunction } from 'express';
import { CheckinService } from '../services/checkin.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export class CheckinController {
  static async lookup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventId, query: queryText } = req.body;
      const result = await CheckinService.lookupAttendee(eventId, queryText);

      return sendSuccess(res, result, result ? 'Attendee record found.' : 'No attendee record found.');
    } catch (error) {
      next(error);
    }
  }

  static async approve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventId, attendeeRosterId, attendeeId } = req.body;
      const approvedByOrganizerId = req.user!.userId;
      const userRole = req.user!.role;

      const result = await CheckinService.approveCheckIn({
        eventId,
        attendeeId: attendeeId || attendeeRosterId,
        approvedByOrganizerId,
        userRole,
      });

      return sendSuccess(res, result, 'Check-in approved and Attended badge granted.');
    } catch (error) {
      next(error);
    }
  }
}
