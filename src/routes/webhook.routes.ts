import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';

const router = Router();

router.post('/paypal', webhookController.handlePaypal);

export default router;
