import { Router } from 'express';
import { CheckinController } from '../controllers/checkin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateCheckIn } from '../middlewares/validate.middleware';

const router = Router();

// Scan QR token and verify attendance
router.post(
  '/verify',
  authenticate,
  authorizeRoles('organizer', 'admin'),
  validateCheckIn,
  CheckinController.verifyCheckIn
);

export default router;

