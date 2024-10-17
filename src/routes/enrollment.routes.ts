import { Router } from 'express';
import * as enrollmentController from '../controller/enrollment.controller';
import { isAdmin } from '../middleware/roleCheckMiddleware';

const router: Router = Router();

// Public access: Get the list of enrollments
router.get('/', enrollmentController.enrollmentList);

// Admin only: Create a new comment
router.get('/create', isAdmin, enrollmentController.enrollmentCreateGet);

// Admin only: Create new enrollment
router.post('/create', isAdmin, enrollmentController.enrollmentCreatePost);

// Public access: Get details of a specific enrollment
router.get('/:id', enrollmentController.enrollmentDetails);

// Admin only: Create a new comment
router.get('/:id/update', isAdmin, enrollmentController.enrollmentUpdateGet);

// Admin only: Update an existing enrollment
router.post('/:id/update', isAdmin, enrollmentController.enrollmentUpdatePost);

// Admin only: Delete an enrollment
router.post('/:id/delete', isAdmin, enrollmentController.enrollmentDeletePost);

export default router;
