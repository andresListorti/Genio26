import { Router } from 'express';
import { shoeController } from '../controllers/shoe.controller';

const router = Router();

router.get('/', shoeController.list);
router.get('/:id', shoeController.getById);
router.post('/', shoeController.create);
router.put('/:id', shoeController.update);
router.delete('/:id', shoeController.remove);

export default router;
