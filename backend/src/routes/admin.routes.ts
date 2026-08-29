import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticate, authorizeRoles('admin'));

router.get('/dashboard', AdminController.getDashboard);
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', AdminController.toggleUserStatus);
router.get('/payments', AdminController.getPayments);

export default router;
