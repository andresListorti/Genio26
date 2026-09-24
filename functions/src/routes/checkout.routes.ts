import { Router } from 'express';
import { checkoutController } from '../controllers/checkout.controller';

const router = Router();

router.get('/status', checkoutController.status);

// PayPal
router.post('/orders', checkoutController.createOrder);
router.post('/orders/:orderId/capture', checkoutController.capture);
router.get('/orders/:orderId', checkoutController.getOrder);

// Mercado Pago (Checkout Bricks — seamless, in-app)
router.post('/mercadopago', checkoutController.createMercadoPagoPreference);
router.post('/mercadopago/process', checkoutController.processMercadoPagoPayment);
// Confirms a payment after the MP redirect flow (success / pending back_url)
router.post('/mercadopago/confirm', checkoutController.confirmMercadoPagoPayment);

export default router;
