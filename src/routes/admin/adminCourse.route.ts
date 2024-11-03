import { Router } from 'express';
import * as adminCourseController from '../../controller/admin/adminCourse.controller';
import { isAdmin } from '../../middleware/roleCheckMiddleware';

const router: Router = Router();

router.get('/courses', isAdmin, adminCourseController.adminCourseShowGet);  
router.get('/courses/:courseId/sections', isAdmin, adminCourseController.getCourseSections);
export default router;
