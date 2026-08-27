import { Request, Response, NextFunction } from 'express';
import { EventService } from '../services/event.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export class EventController {
  static async createEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const organizerId = req.user!.userId;
      const {
        title,
        description,
        category,
        event_date,
        end_date,
        location,
        capacity,
        banner_url,
        status,
      } = req.body;

      const event = await EventService.createEvent(organizerId, {
        title,
        description,
        category,
        event_date,
        end_date,
        location,
        capacity,
        banner_url,
        status,
      });

      return sendSuccess(res, event, 'Event created successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, category, status, organizerId, upcomingOnly, limit, offset } = req.query;

      const events = await EventService.getEvents({
        search: search as string,
        category: category as string,
        status: status as string,
        organizerId: organizerId as string,
        upcomingOnly: upcomingOnly === 'true',
        limit: limit ? parseInt(limit as string, 10) : 50,
        offset: offset ? parseInt(offset as string, 10) : 0,
      });

      return sendSuccess(res, events, 'Events retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async getEventById(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id as string;
      const event = await EventService.getEventById(eventId);

      return sendSuccess(res, event, 'Event details retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async updateEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id as string;
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      const updatedEvent = await EventService.updateEvent(
        eventId,
        userId,
        userRole,
        req.body
      );

      return sendSuccess(res, updatedEvent, 'Event updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async deleteEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id as string;
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      await EventService.deleteEvent(eventId, userId, userRole);

      return sendSuccess(res, null, 'Event deleted successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async registerForEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id as string;
      const userId = req.user!.userId;

      const registration = await EventService.registerForEvent(eventId, userId);

      return sendSuccess(
        res,
        registration,
        'Successfully registered for event. QR Ticket issued.',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async getUserRegistration(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id as string;
      const userId = req.user!.userId;

      const registration = await EventService.getUserRegistration(eventId, userId);

      return sendSuccess(
        res,
        registration,
        registration ? 'Registration details retrieved.' : 'User is not registered for this event.'
      );
    } catch (error) {
      next(error);
    }
  }

  static async cancelRegistration(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.id as string;
      const userId = req.user!.userId;

      const result = await EventService.cancelRegistration(eventId, userId);

      return sendSuccess(res, result, 'Registration cancelled successfully.');
    } catch (error) {
      next(error);
    }
  }
}

