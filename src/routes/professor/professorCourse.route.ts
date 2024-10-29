import { Router } from 'express';
import * as professorCourseController from '../../controller/professor/professorCourse.controller';
import { isProfessor } from '../../middleware/roleCheckMiddleware';

const router: Router = Router();

router.get('/courses', isProfessor, professorCourseController.professorCourseShowGet);  
router.post('/courses/create', isProfessor, professorCourseController.professorCreateCourse);
router.post('/courses/edit', isProfessor, professorCourseController.professorUpdateCourse);
router.delete('/courses/delete/:id', isProfessor, professorCourseController.professorDeleteCourse);
export default router;
