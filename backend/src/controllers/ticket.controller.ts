import { Response, NextFunction } from 'express';
import { TicketService } from '../services/ticket.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export class TicketController {
  static async issueTicket(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.eventId as string;
      const userId = req.user!.userId;

      const ticket = await TicketService.issueTicket(eventId, userId);

      return sendSuccess(res, ticket, 'Ticket issued successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getTicket(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.eventId as string;
      const userId = req.user!.userId;

      const ticket = await TicketService.getTicketByEventAndUser(eventId, userId);

      return sendSuccess(res, ticket, 'Ticket retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async getTicketById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ticketId = req.params.id as string;
      const ticket = await TicketService.getTicketById(ticketId);

      return sendSuccess(res, ticket, 'Ticket details retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }
}

