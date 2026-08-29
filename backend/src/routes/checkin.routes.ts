import { Router } from 'express';
import { CheckinController } from '../controllers/checkin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

router.post(
  '/lookup',
  authenticate,
  authorizeRoles('organizer', 'admin'),
  CheckinController.lookup
);

router.post(
  '/approve',
  authenticate,
  authorizeRoles('organizer', 'admin'),
  CheckinController.approve
);

export default router;
