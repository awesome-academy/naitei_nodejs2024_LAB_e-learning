import { Router } from 'express';
import * as adminCourseController from '../../controller/admin/adminLesson.controller';
import { isAdmin } from '../../middleware/roleCheckMiddleware';

const router: Router = Router();

router.get('/lessons', isAdmin, adminCourseController.adminLesonShowGet);  
export default router;
