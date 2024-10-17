import { Router } from 'express';
import * as courseController from '../controller/course.controller';

const router: Router = Router();


router.get('/', courseController.courseShowGet);  

router.post('/', courseController.filterAndSort)

router.post('/:course_id/payment', courseController.createPaymentRecord)

router.get('/:id',courseController.getCourseDetail);

export default router;
