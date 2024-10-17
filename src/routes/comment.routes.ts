import { Router } from 'express';
import * as commentController from '../controller/comment.controller';
import { isAdmin } from '../middleware/roleCheckMiddleware';

const router: Router = Router();

// Public access: Get the list of comments
router.get('/', commentController.commentList);

// Admin only: Create a new comment
router.get('/create', isAdmin, commentController.commentCreateGet);

// Admin only: Create a new comment
router.post('/create', isAdmin, commentController.commentCreatePost);

// Public access: Get details of a specific comment
router.get('/:id', commentController.commentDetails);

// Admin only: Create a new comment
router.get('/:id/update', isAdmin, commentController.commentUpdateGet);

// Admin only: Update an existing comment
router.post('/:id/update', isAdmin, commentController.commentUpdatePost);

// Admin only: Delete a comment
router.post('/:id/delete', isAdmin, commentController.commentDeletePost);

export default router;
