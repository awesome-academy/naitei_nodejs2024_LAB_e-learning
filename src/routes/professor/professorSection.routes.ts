import { Router } from 'express';
import * as professorSectionController from '../../controller/professor/professorSection.controller';
import { isProfessor } from '../../middleware/roleCheckMiddleware';

const router: Router = Router();

router.get('/sections', isProfessor, professorSectionController.professorSectionShowGet);
router.post('/sections/create', isProfessor, professorSectionController.professorCreateSection);
router.post('/sections/edit', isProfessor, professorSectionController.professorUpdateSection);
router.delete('/sections/delete/:id', isProfessor, professorSectionController.professorDeleteSection);

export default router;
