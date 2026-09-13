import { Router } from 'express';
import { BadgeController } from '../controllers/badge.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

// Public / Attendee badge inspection
router.get('/', BadgeController.getAllBadges);
router.get('/event/:eventId/attended', BadgeController.getAttendedBadgeHolders);
router.get('/:id', BadgeController.getBadgeById);
router.get('/user/:userId', BadgeController.getAttendeeBadges);

// Organizer Single Shared Badge Award (Section 7)
router.post(
  '/award',
  authenticate,
  authorizeRoles('organizer', 'admin'),
  BadgeController.awardBadge
);

// Organizer Bulk Award
router.post(
  '/bulk-award',
  authenticate,
  authorizeRoles('organizer', 'admin'),
  BadgeController.bulkAwardBadges
);

// Admin-Only Revocation
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('admin'),
  BadgeController.revokeBadge
);

router.post(
  '/:id/revoke',
  authenticate,
  authorizeRoles('admin'),
  BadgeController.revokeBadge
);

export default router;
