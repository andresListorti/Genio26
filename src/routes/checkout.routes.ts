import { Router } from 'express';
import { checkoutController } from '../controllers/checkout.controller';

const router = Router();

router.post('/orders', checkoutController.createOrder);
router.post('/orders/:orderId/capture', checkoutController.capture);
router.get('/orders/:orderId', checkoutController.getOrder);

export default router;
