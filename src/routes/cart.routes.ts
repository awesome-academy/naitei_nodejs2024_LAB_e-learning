import { Router } from 'express';
import * as cartController from '../controller/cart.controller';

const router: Router = Router();

router.get('/add', cartController.addItemToCartGet)
router.post('/add', cartController.addItemToCart);
router.get('/', cartController.viewCart);
router.delete('/:id', cartController.removeItemFromCart);
export default router;
