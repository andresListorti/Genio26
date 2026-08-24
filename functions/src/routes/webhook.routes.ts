import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';

const router = Router();

router.post('/paypal', webhookController.handlePaypal);
router.post('/mercadopago', webhookController.handleMercadoPago);

export default router;
