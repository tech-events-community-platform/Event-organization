import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

router.get(
  '/events/:id',
  authenticate,
  authorizeRoles('organizer', 'admin'),
  ReportController.getEventReport
);

router.get(
  '/events/:id/export',
  authenticate,
  authorizeRoles('organizer', 'admin'),
  ReportController.exportEventReportCsv
);

export default router;

