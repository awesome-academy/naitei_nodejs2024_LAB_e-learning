import { Router } from 'express';
import { processPayment, submitPayment  } from '../controller/payment.controller';

const router = Router();

router.post('/checkout', processPayment);  
router.post('/submit', submitPayment);

export default router;
