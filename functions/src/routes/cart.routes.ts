import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';

const router = Router();

router.post('/', cartController.create);
router.get('/:id', cartController.getById);
router.post('/:id/items', cartController.addItem);
router.delete('/:id/items', cartController.removeItem);
router.delete('/:id', cartController.clear);

export default router;
