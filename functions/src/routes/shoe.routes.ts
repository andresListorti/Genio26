import { Router } from 'express';
import { shoeController } from '../controllers/shoe.controller';
import { requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', shoeController.list);
router.get('/:id', shoeController.getById);
router.post('/', requireAdmin, shoeController.create);
router.put('/:id', requireAdmin, shoeController.update);
router.delete('/:id', requireAdmin, shoeController.remove);

export default router;
