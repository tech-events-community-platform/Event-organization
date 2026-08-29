import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateEvent } from '../middlewares/validate.middleware';

const router = Router();

// Public & Share links
router.get('/', EventController.getEvents);
router.get('/share/:token', EventController.getEventByShareToken);
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
router.get('/:id/roster', authenticate, authorizeRoles('organizer', 'admin'), EventController.getEventRoster);
router.get('/:id/attendees', authenticate, authorizeRoles('organizer', 'admin'), EventController.getEventRoster);
router.get('/:id/lookup', authenticate, authorizeRoles('organizer', 'admin'), EventController.lookupAttendee);

export default router;
