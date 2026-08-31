import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { sendSuccess } from '../utils/apiResponse';

export class AdminController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getDashboardMetrics();
      return sendSuccess(res, stats, 'Admin dashboard metrics retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const usersData = await AdminService.getUsersList();
      return sendSuccess(res, usersData, 'Platform users retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async approveOrganizer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const updated = await AdminService.approveOrganizer(id);
      return sendSuccess(res, updated, 'Organizer approved and activated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async rejectOrganizer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const updated = await AdminService.rejectOrganizer(id);
      return sendSuccess(res, updated, 'Organizer registration rejected.');
    } catch (error) {
      next(error);
    }
  }

  static async toggleUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const updated = await AdminService.toggleUserStatus(id);
      return sendSuccess(res, updated, 'User status updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await AdminService.getPaymentIssues();
      return sendSuccess(res, payments, 'Payment issues & split logs retrieved.');
    } catch (error) {
      next(error);
    }
  }
}
