import { Router } from 'express';
import * as courseController from '../controllers/course.controller';

const router: Router = Router();

router.get('/', courseController.courseList);

router.get('/create', courseController.createCourseGet);

router.get('/:id', courseController.courseDetails);

router.post('/create', courseController.createCoursePost);

router.get('/:id/delete', courseController.deleteCourseGet);

router.post('/:id/delete', courseController.deleteCoursePost);

router.get('/:id/update', courseController.updateCourseGet);

router.post('/:id/update', courseController.updateCoursePost);

export default router;
