import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateEvent } from '../middlewares/validate.middleware';

const router = Router();

// Public event browsing
router.get('/', EventController.getEvents);
router.get('/:id', EventController.getEventById);

// Organizer Event Management
router.post(
  '/',
  authenticate,
  authorizeRoles('organizer', 'admin'),
  validateEvent,
  EventController.createEvent
);

router.patch(
  '/:id',
  authenticate,
  authorizeRoles('organizer', 'admin'),
  EventController.updateEvent
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('organizer', 'admin'),
  EventController.deleteEvent
);

// Attendee Registration
router.post('/:id/register', authenticate, EventController.registerForEvent);
router.get('/:id/registration', authenticate, EventController.getUserRegistration);
router.delete('/:id/register', authenticate, EventController.cancelRegistration);

export default router;

