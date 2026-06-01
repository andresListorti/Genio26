import { Router } from 'express';
import { checkoutController } from '../controllers/checkout.controller';

const router = Router();

// PayPal
router.post('/orders', checkoutController.createOrder);
router.post('/orders/:orderId/capture', checkoutController.capture);
router.get('/orders/:orderId', checkoutController.getOrder);

// Mercado Pago (Checkout Bricks — seamless, in-app)
router.post('/mercadopago', checkoutController.createMercadoPagoPreference);
router.post(
  '/mercadopago/process',
  checkoutController.processMercadoPagoPayment,
);

export default router;
