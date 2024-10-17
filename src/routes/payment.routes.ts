import { Router } from 'express';
import { showPaymentPage } from '../controller/payment.controller';

const router = Router();

// Define the payment route for a specific course
router.get('/:payment_id', showPaymentPage);

export default router;
