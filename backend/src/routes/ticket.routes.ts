import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, TicketController.getMyTickets);
router.get('/:eventId', authenticate, TicketController.getTicket);
router.get('/id/:id', authenticate, TicketController.getTicketById);

export default router;
