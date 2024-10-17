import { Router } from 'express';
import * as lessonController from '../controller/lesson.controller';
import { isAdmin } from '../middleware/roleCheckMiddleware';

const router: Router = Router();

// Public access: Get the list of lessons
router.get('/', lessonController.lessonList);

// Admin only: Create a new comment
router.get('/create', isAdmin, lessonController.lessonCreateGet);

// Admin only: Create a new lesson
router.post('/create', isAdmin, lessonController.lessonCreatePost);

// Public access: Get details of a specific lesson
router.get('/:id', lessonController.lessonDetails);

// Admin only: Create a new comment
router.get('/:id/update', isAdmin, lessonController.lessonUpdateGet);

// Admin only: Update an existing lesson
router.post('/:id/update', isAdmin, lessonController.lessonUpdatePost);

// Admin only: Delete a lesson
router.post('/:id/delete', isAdmin, lessonController.lessonDeletePost);

export default router;
