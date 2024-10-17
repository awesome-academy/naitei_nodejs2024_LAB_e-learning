import { Router } from 'express';
import * as paymentController from '../controller/payment.controller';
import { isAdmin } from '../middleware/roleCheckMiddleware';

const router: Router = Router();

// Public access: Get the list of payments
router.get('/', paymentController.paymentList);

// Admin only: Create a new comment
router.get('/create', isAdmin, paymentController.paymentCreateGet);

// Admin only: Create a new payment
router.post('/create', isAdmin, paymentController.paymentCreatePost);

// Public access: Get details of a specific payment
router.get('/:id', paymentController.paymentDetails);

// Admin only: Create a new comment
router.get('/:id/update', isAdmin, paymentController.paymentUpdateGet);

// Admin only: Update an existing payment
router.post('/:id/update', isAdmin, paymentController.paymentUpdatePost);

// Admin only: Delete a payment
router.post('/:id/delete', isAdmin, paymentController.paymentDeletePost);

export default router;
