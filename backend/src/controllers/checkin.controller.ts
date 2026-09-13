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

  static async markAttended(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventId, attendeeRosterId, attendeeId } = req.body;
      const approvedByOrganizerId = req.user!.userId;
      const userRole = req.user!.role;

      const result = await CheckinService.markAttended({
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

  static async undo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventId, attendeeRosterId, attendeeId } = req.body;
      const undoneByOrganizerId = req.user!.userId;
      const userRole = req.user!.role;

      const result = await CheckinService.undoCheckIn({
        eventId,
        attendeeId: attendeeId || attendeeRosterId,
        undoneByOrganizerId,
        userRole,
      });

      return sendSuccess(res, result, 'Check-in undone successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async addManualAttendee(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventId, name, email, phone } = req.body;
      const organizerId = req.user!.userId;
      const userRole = req.user!.role;

      const result = await CheckinService.addManualAttendee({
        eventId,
        organizerId,
        name,
        email,
        phone,
        userRole,
      });

      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async approve(req: AuthRequest, res: Response, next: NextFunction) {
    return CheckinController.markAttended(req, res, next);
  }
}
