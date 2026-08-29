import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/profile', authenticate, UserController.getProfile);
router.get('/me', authenticate, UserController.getProfile);
router.patch('/me', authenticate, UserController.updateProfile);
router.patch('/me/visibility', authenticate, UserController.updateVisibility);
router.delete('/me', authenticate, UserController.deleteAccount);
router.get('/me/export', authenticate, UserController.exportUserData);
router.get('/me/tickets', authenticate, UserController.getMyTickets);
router.get('/me/attendance', authenticate, UserController.getAttendanceHistory);

// Public profile
router.get('/:id/public', UserController.getPublicProfile);

export default router;
