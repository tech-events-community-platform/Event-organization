import { Router } from 'express';
import { SponsorshipController } from '../controllers/sponsorship.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware';

const router = Router();

// Organizer Routes
router.post('/applications', authenticate, SponsorshipController.createApplication);
router.get('/organizer/my-applications', authenticate, SponsorshipController.getMyApplications);
router.delete('/applications/:id', authenticate, SponsorshipController.deleteApplication);

// Sponsor Marketplace Routes
router.get('/explore', optionalAuthenticate, SponsorshipController.exploreApplications);
router.get('/applications/:id', optionalAuthenticate, SponsorshipController.getApplication);

// Sponsor Deals Pipeline
router.post('/deals', authenticate, SponsorshipController.expressInterestOrDecline);
router.get('/sponsor/my-deals', authenticate, SponsorshipController.getMyDeals);
router.patch('/deals/:id', authenticate, SponsorshipController.updateDeal);

export default router;
