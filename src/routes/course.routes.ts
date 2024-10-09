import { Router } from 'express';
import * as courseController from '../controller/course.controller';
import { isAdmin } from '../middleware/roleCheckMiddleware';

const router: Router = Router();


router.get('/', courseController.courseShowGet);  
router.post('/', courseController.filterAndSort);
router.get('/:id',courseController.getCourseDetail);

// user panel crud
// Get all courses
router.get('/', courseController.courseList);

// Get course creation form (optional, for view rendering)
router.get('/create', isAdmin, courseController.courseCreateGet);

// Create a new course
router.post('/create', isAdmin, courseController.courseCreatePost);

// Get details of a specific course
router.get('/:id', courseController.courseDetails);

// Get course deletion form (optional, for view rendering)
router.get('/:id/delete', isAdmin, courseController.courseDeleteGet);

// Delete a specific course
router.post('/:id/delete', isAdmin, courseController.courseDeletePost);

// Get course update form (optional, for view rendering)
router.get('/:id/update', isAdmin, courseController.courseUpdateGet);

// Update a specific course
router.post('/:id/update', isAdmin, courseController.courseUpdatePost);

export default router;
