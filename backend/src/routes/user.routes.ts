import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/me', authenticate, UserController.getProfile);
router.patch('/me', authenticate, UserController.updateProfile);
router.get('/me/attendance', authenticate, UserController.getAttendanceHistory);

export default router;

