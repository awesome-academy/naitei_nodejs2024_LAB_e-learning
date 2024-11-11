import { Router } from 'express';
import * as professorUserController from '../../controller/professor/professorStudent.controller';
import { isProfessor } from '../../middleware/roleCheckMiddleware';

const router: Router = Router();

router.get('/users', isProfessor, professorUserController.professorUserShowGet);  

export default router;
