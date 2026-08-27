import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import eventRoutes from './event.routes';
import ticketRoutes from './ticket.routes';
import checkinRoutes from './checkin.routes';
import reportRoutes from './report.routes';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Sheba API is running smoothly.',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/tickets', ticketRoutes);
router.use('/checkin', checkinRoutes);
router.use('/reports', reportRoutes);

export default router;

