import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRegistration, validateLogin } from '../middlewares/validate.middleware';

const router = Router();

router.post('/register', validateRegistration, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/google', AuthController.googleLogin);
router.post('/reset-password', AuthController.resetPassword);
router.get('/me', authenticate, AuthController.getMe);
router.post('/apply-organizer', authenticate, AuthController.applyForOrganizer);
router.post('/switch-role', authenticate, AuthController.switchRole);
router.post('/logout', authenticate, AuthController.logout);

// Sponsor Auth Endpoints (Completely decoupled role & portal)
router.post('/sponsor/register', AuthController.registerSponsor);
router.post('/sponsor/login', AuthController.loginSponsor);
router.post('/sponsor/google', AuthController.googleSponsorLogin);
router.post('/sponsor/forgot-password/otp', AuthController.sendSponsorOtp);
router.post('/sponsor/verify-otp', AuthController.verifySponsorOtp);
router.post('/sponsor/reset-password/otp', AuthController.resetSponsorPasswordWithOtp);

export default router;

