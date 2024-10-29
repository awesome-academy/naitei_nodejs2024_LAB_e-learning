import { Router } from 'express';
import * as professorCourseController from '../../controller/professor/professorLesson.controller';
import { isProfessor } from '../../middleware/roleCheckMiddleware';

const router: Router = Router();

router.get('/lessons', isProfessor, professorCourseController.professorLesonShowGet);  
router.post('/lessons/create', isProfessor, professorCourseController.professorCreateLesson);  
router.post('/lessons/edit', isProfessor, professorCourseController.professorUpdateLesson);  
router.delete('/lessons/delete/:id', isProfessor, professorCourseController.professorDeleteLesson);  
export default router;
