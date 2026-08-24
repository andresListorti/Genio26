import { Router } from 'express';
import shoeRoutes from './shoe.routes';
import cartRoutes from './cart.routes';
import checkoutRoutes from './checkout.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'zapateria-genaro-api' });
});

router.use('/shoes', shoeRoutes);
router.use('/carts', cartRoutes);
router.use('/checkout', checkoutRoutes);

export default router;
