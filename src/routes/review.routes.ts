import { Router } from 'express';
import * as reviewController from '../controller/review.controller';
import { isAdmin } from '../middleware/roleCheckMiddleware';

const router: Router = Router();

// Public access: Get the list of reviews
router.get('/', reviewController.reviewList);

// Admin only: Create a new comment
router.get('/create', isAdmin, reviewController.reviewCreateGet);

// Admin only: Create a new review
router.post('/create', isAdmin, reviewController.reviewCreatePost);

// Public access: Get details of a specific review
router.get('/:id', reviewController.reviewDetails);

// Admin only: Create a new comment
router.get('/:id/update', isAdmin, reviewController.reviewUpdateGet);

// Admin only: Update an existing review
router.post('/:id/update', isAdmin, reviewController.reviewUpdatePost);

// Admin only: Delete a review
router.post('/:id/delete', isAdmin, reviewController.reviewDeletePost);

export default router;
